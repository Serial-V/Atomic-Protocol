import { EventEmitter } from 'events';
import { config } from '../config/config';
import { RaknetClient } from '../rak';
import { createDecryptor, createEncryptor } from '../transforms/encryption';
import Framer from '../transforms/framer';
import { createDeserializer, createSerializer } from "../transforms/serializer";
import { clientStatus } from '../types';

export class Connection extends EventEmitter {
    public connection!: RaknetClient;
    encryptionEnabled = false;
    batchHeader = 0xfe;
    compressionReady = false;
    compressionAlgorithm = 'none';
    compressionThreshold = 512;
    compressionHeader = 0;
    compressionLevel = 7;
    framer = new Framer(this);
    decrypt: any;
    encrypt: any;
    #status = clientStatus.Disconnected;
    sendQ: Buffer[] = [];
    loop!: NodeJS.Timeout;
    serializer: any;
    deserializer: any;

    constructor() {
        super();
        this.serializer = createSerializer();
        this.deserializer = createDeserializer();
    };

    get status() {
        return this.#status;
    };

    set status(val: number) {
        this.emit('status', val);
        this.#status = val;
    };

    startEncryption(iv: any) {
        this.encryptionEnabled = true;
        //@ts-ignore
        if (config.debug) console.log(`<DEBUG> Started Encryption`, this.sharedSecret, iv);
        this.decrypt = createDecryptor(this, iv);
        this.encrypt = createEncryptor(this, iv);
    };

    write(name: any, params: any) {
        this.framer.reset(this);
        const packet = this.serializer.createPacketBuffer({ name, params });
        this.framer.addEncodedPacket(packet);

        if (this.encryptionEnabled) this.sendEncryptedBatch(this.framer);
        else this.sendDecryptedBatch(this.framer);
    };

    queue(name: any, params: any) {
        const packet = this.serializer.createPacketBuffer({ name, params });
        if (name === 'level_chunk') return; //The client does not need the world data...
        this.sendQ.push(packet);
    };

    _tick() {
        if (this.sendQ.length) {
            this.framer.reset(this);
            this.framer.addEncodedPackets(this.sendQ);
            this.sendQ = [];

            if (this.encryptionEnabled) this.sendEncryptedBatch(this.framer);
            else this.sendDecryptedBatch(this.framer);
        };
    };

    onTick = this._tick.bind(this);

    sendBuffer(buffer: Buffer, immediate?: boolean) {
        if (!immediate) return this.sendQ.push(buffer);
        this.framer.reset(this);
        this.framer.addEncodedPacket(buffer);
        if (this.encryptionEnabled) this.sendEncryptedBatch(this.framer);
        else this.sendDecryptedBatch(this.framer);
    };

    sendEncryptedBatch(batch: Framer) {
        const buf = batch.getBuffer();
        this.encrypt(buf);
    };

    sendDecryptedBatch(batch: Framer) {
        this.sendPackets(batch.encode(), true);
    };

    sendPackets(buffer: Buffer, immediate: boolean) { // Added "?" v3.6.1 due to TypeError: Cannot read properties of undefined (reading 'connected') ~ NoVa
        if (this?.connection?.connected === false || this.status === clientStatus.Disconnected) return;
        try {
            this.connection.sendReliable(buffer, immediate);
        } catch (e) {
            console.error('while sending to', this.connection, e);
        };
    };

    onEncryptedPacket = (buf: Buffer) => {
        const packet = this.batchHeader ? Buffer.concat([Buffer.from([this.batchHeader]), buf]) : buf;
        this.sendPackets(packet, false);
    };

    onDecryptedPacket = (buf: Buffer) => {
        const packets = Framer.getPackets(buf);
        packets.forEach((packet) => {
            //@ts-ignore
            this.readPacket(packet);
        });
    };

    handle(buffer: Buffer) {
        if (!this.batchHeader || buffer[0] === this.batchHeader) {
            if (this.encryptionEnabled) this.decrypt(buffer.slice(1));
            else {
                const packets = Framer.decode(this, buffer);
                for (let packet of packets) {
                    //@ts-ignore
                    this.readPacket(packet);
                }
            };
        } else {
            this.emit("error", new Error(`bad packet header` + buffer[0]));
            (this as any).close?.();
            return;
        };
    };
};