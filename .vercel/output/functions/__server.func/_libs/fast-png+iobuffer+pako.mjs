import { n as __esmMin, r as __exportAll } from "../_runtime.mjs";
//#region node_modules/iobuffer/lib-esm/text.js
function decode(bytes, encoding = "utf8") {
	return new TextDecoder(encoding).decode(bytes);
}
function encode(str) {
	return encoder.encode(str);
}
var encoder;
var init_text$1 = __esmMin((() => {
	encoder = new TextEncoder();
}));
//#endregion
//#region node_modules/iobuffer/lib-esm/IOBuffer.js
var defaultByteLength, hostBigEndian, typedArrays, IOBuffer;
var init_IOBuffer = __esmMin((() => {
	init_text$1();
	defaultByteLength = 8192;
	hostBigEndian = (() => {
		const array = /* @__PURE__ */ new Uint8Array(4);
		const view = new Uint32Array(array.buffer);
		return !((view[0] = 1) & array[0]);
	})();
	typedArrays = {
		int8: globalThis.Int8Array,
		uint8: globalThis.Uint8Array,
		int16: globalThis.Int16Array,
		uint16: globalThis.Uint16Array,
		int32: globalThis.Int32Array,
		uint32: globalThis.Uint32Array,
		uint64: globalThis.BigUint64Array,
		int64: globalThis.BigInt64Array,
		float32: globalThis.Float32Array,
		float64: globalThis.Float64Array
	};
	IOBuffer = class IOBuffer {
		/**
		* Reference to the internal ArrayBuffer object.
		*/
		buffer;
		/**
		* Byte length of the internal ArrayBuffer.
		*/
		byteLength;
		/**
		* Byte offset of the internal ArrayBuffer.
		*/
		byteOffset;
		/**
		* Byte length of the internal ArrayBuffer.
		*/
		length;
		/**
		* The current offset of the buffer's pointer.
		*/
		offset;
		lastWrittenByte;
		littleEndian;
		_data;
		_mark;
		_marks;
		/**
		* Create a new IOBuffer.
		* @param data - The data to construct the IOBuffer with.
		* If data is a number, it will be the new buffer's length<br>
		* If data is `undefined`, the buffer will be initialized with a default length of 8Kb<br>
		* If data is an ArrayBuffer, SharedArrayBuffer, an ArrayBufferView (Typed Array), an IOBuffer instance,
		* or a Node.js Buffer, a view will be created over the underlying ArrayBuffer.
		* @param options - An object for the options.
		* @returns A new IOBuffer instance.
		*/
		constructor(data = defaultByteLength, options = {}) {
			let dataIsGiven = false;
			if (typeof data === "number") data = new ArrayBuffer(data);
			else {
				dataIsGiven = true;
				this.lastWrittenByte = data.byteLength;
			}
			const offset = options.offset ? options.offset >>> 0 : 0;
			const byteLength = data.byteLength - offset;
			let dvOffset = offset;
			if (ArrayBuffer.isView(data) || data instanceof IOBuffer) {
				if (data.byteLength !== data.buffer.byteLength) dvOffset = data.byteOffset + offset;
				data = data.buffer;
			}
			if (dataIsGiven) this.lastWrittenByte = byteLength;
			else this.lastWrittenByte = 0;
			this.buffer = data;
			this.length = byteLength;
			this.byteLength = byteLength;
			this.byteOffset = dvOffset;
			this.offset = 0;
			this.littleEndian = true;
			this._data = new DataView(this.buffer, dvOffset, byteLength);
			this._mark = 0;
			this._marks = [];
		}
		/**
		* Checks if the memory allocated to the buffer is sufficient to store more
		* bytes after the offset.
		* @param byteLength - The needed memory in bytes.
		* @returns `true` if there is sufficient space and `false` otherwise.
		*/
		available(byteLength = 1) {
			return this.offset + byteLength <= this.length;
		}
		/**
		* Check if little-endian mode is used for reading and writing multi-byte
		* values.
		* @returns `true` if little-endian mode is used, `false` otherwise.
		*/
		isLittleEndian() {
			return this.littleEndian;
		}
		/**
		* Set little-endian mode for reading and writing multi-byte values.
		* @returns This.
		*/
		setLittleEndian() {
			this.littleEndian = true;
			return this;
		}
		/**
		* Check if big-endian mode is used for reading and writing multi-byte values.
		* @returns `true` if big-endian mode is used, `false` otherwise.
		*/
		isBigEndian() {
			return !this.littleEndian;
		}
		/**
		* Switches to big-endian mode for reading and writing multi-byte values.
		* @returns This.
		*/
		setBigEndian() {
			this.littleEndian = false;
			return this;
		}
		/**
		* Move the pointer n bytes forward.
		* @param n - Number of bytes to skip.
		* @returns This.
		*/
		skip(n = 1) {
			this.offset += n;
			return this;
		}
		/**
		* Move the pointer n bytes backward.
		* @param n - Number of bytes to move back.
		* @returns This.
		*/
		back(n = 1) {
			this.offset -= n;
			return this;
		}
		/**
		* Move the pointer to the given offset.
		* @param offset - The offset to move to.
		* @returns This.
		*/
		seek(offset) {
			this.offset = offset;
			return this;
		}
		/**
		* Store the current pointer offset.
		* @see {@link IOBuffer#reset}
		* @returns This.
		*/
		mark() {
			this._mark = this.offset;
			return this;
		}
		/**
		* Move the pointer back to the last pointer offset set by mark.
		* @see {@link IOBuffer#mark}
		* @returns This.
		*/
		reset() {
			this.offset = this._mark;
			return this;
		}
		/**
		* Push the current pointer offset to the mark stack.
		* @see {@link IOBuffer#popMark}
		* @returns This.
		*/
		pushMark() {
			this._marks.push(this.offset);
			return this;
		}
		/**
		* Pop the last pointer offset from the mark stack, and set the current
		* pointer offset to the popped value.
		* @see {@link IOBuffer#pushMark}
		* @returns This.
		*/
		popMark() {
			const offset = this._marks.pop();
			if (offset === void 0) throw new Error("Mark stack empty");
			this.seek(offset);
			return this;
		}
		/**
		* Move the pointer offset back to 0.
		* @returns This.
		*/
		rewind() {
			this.offset = 0;
			return this;
		}
		/**
		* Make sure the buffer has sufficient memory to write a given byteLength at
		* the current pointer offset.
		* If the buffer's memory is insufficient, this method will create a new
		* buffer (a copy) with a length that is twice (byteLength + current offset).
		* @param byteLength - The needed memory in bytes.
		* @returns This.
		*/
		ensureAvailable(byteLength = 1) {
			if (!this.available(byteLength)) {
				const newLength = (this.offset + byteLength) * 2;
				const newArray = new Uint8Array(newLength);
				newArray.set(new Uint8Array(this.buffer));
				this.buffer = newArray.buffer;
				this.length = newLength;
				this.byteLength = newLength;
				this._data = new DataView(this.buffer);
			}
			return this;
		}
		/**
		* Read a byte and return false if the byte's value is 0, or true otherwise.
		* Moves pointer forward by one byte.
		* @returns The read boolean.
		*/
		readBoolean() {
			return this.readUint8() !== 0;
		}
		/**
		* Read a signed 8-bit integer and move pointer forward by 1 byte.
		* @returns The read byte.
		*/
		readInt8() {
			return this._data.getInt8(this.offset++);
		}
		/**
		* Read an unsigned 8-bit integer and move pointer forward by 1 byte.
		* @returns The read byte.
		*/
		readUint8() {
			return this._data.getUint8(this.offset++);
		}
		/**
		* Alias for {@link IOBuffer#readUint8}.
		* @returns The read byte.
		*/
		readByte() {
			return this.readUint8();
		}
		/**
		* Read `n` bytes and move pointer forward by `n` bytes.
		* @param n - Number of bytes to read.
		* @returns The read bytes.
		*/
		readBytes(n = 1) {
			return this.readArray(n, "uint8");
		}
		/**
		* Creates an array of corresponding to the type `type` and size `size`.
		* For example type `uint8` will create a `Uint8Array`.
		* @param size - size of the resulting array
		* @param type - number type of elements to read
		* @returns The read array.
		*/
		readArray(size, type) {
			const bytes = typedArrays[type].BYTES_PER_ELEMENT * size;
			const offset = this.byteOffset + this.offset;
			const slice = this.buffer.slice(offset, offset + bytes);
			if (this.littleEndian === hostBigEndian && type !== "uint8" && type !== "int8") {
				const slice = new Uint8Array(this.buffer.slice(offset, offset + bytes));
				slice.reverse();
				const returnArray = new typedArrays[type](slice.buffer);
				this.offset += bytes;
				returnArray.reverse();
				return returnArray;
			}
			const returnArray = new typedArrays[type](slice);
			this.offset += bytes;
			return returnArray;
		}
		/**
		* Read a 16-bit signed integer and move pointer forward by 2 bytes.
		* @returns The read value.
		*/
		readInt16() {
			const value = this._data.getInt16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;
		}
		/**
		* Read a 16-bit unsigned integer and move pointer forward by 2 bytes.
		* @returns The read value.
		*/
		readUint16() {
			const value = this._data.getUint16(this.offset, this.littleEndian);
			this.offset += 2;
			return value;
		}
		/**
		* Read a 32-bit signed integer and move pointer forward by 4 bytes.
		* @returns The read value.
		*/
		readInt32() {
			const value = this._data.getInt32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		}
		/**
		* Read a 32-bit unsigned integer and move pointer forward by 4 bytes.
		* @returns The read value.
		*/
		readUint32() {
			const value = this._data.getUint32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		}
		/**
		* Read a 32-bit floating number and move pointer forward by 4 bytes.
		* @returns The read value.
		*/
		readFloat32() {
			const value = this._data.getFloat32(this.offset, this.littleEndian);
			this.offset += 4;
			return value;
		}
		/**
		* Read a 64-bit floating number and move pointer forward by 8 bytes.
		* @returns The read value.
		*/
		readFloat64() {
			const value = this._data.getFloat64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;
		}
		/**
		* Read a 64-bit signed integer number and move pointer forward by 8 bytes.
		* @returns The read value.
		*/
		readBigInt64() {
			const value = this._data.getBigInt64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;
		}
		/**
		* Read a 64-bit unsigned integer number and move pointer forward by 8 bytes.
		* @returns The read value.
		*/
		readBigUint64() {
			const value = this._data.getBigUint64(this.offset, this.littleEndian);
			this.offset += 8;
			return value;
		}
		/**
		* Read a 1-byte ASCII character and move pointer forward by 1 byte.
		* @returns The read character.
		*/
		readChar() {
			return String.fromCharCode(this.readInt8());
		}
		/**
		* Read `n` 1-byte ASCII characters and move pointer forward by `n` bytes.
		* @param n - Number of characters to read.
		* @returns The read characters.
		*/
		readChars(n = 1) {
			let result = "";
			for (let i = 0; i < n; i++) result += this.readChar();
			return result;
		}
		/**
		* Read the next `n` bytes, return a UTF-8 decoded string and move pointer
		* forward by `n` bytes.
		* @param n - Number of bytes to read.
		* @returns The decoded string.
		*/
		readUtf8(n = 1) {
			return decode(this.readBytes(n));
		}
		/**
		* Read the next `n` bytes, return a string decoded with `encoding` and move pointer
		* forward by `n` bytes.
		* If no encoding is passed, the function is equivalent to @see {@link IOBuffer#readUtf8}
		* @param n - Number of bytes to read.
		* @param encoding - The encoding to use. Default is 'utf8'.
		* @returns The decoded string.
		*/
		decodeText(n = 1, encoding = "utf8") {
			return decode(this.readBytes(n), encoding);
		}
		/**
		* Write 0xff if the passed value is truthy, 0x00 otherwise and move pointer
		* forward by 1 byte.
		* @param value - The value to write.
		* @returns This.
		*/
		writeBoolean(value) {
			this.writeUint8(value ? 255 : 0);
			return this;
		}
		/**
		* Write `value` as an 8-bit signed integer and move pointer forward by 1 byte.
		* @param value - The value to write.
		* @returns This.
		*/
		writeInt8(value) {
			this.ensureAvailable(1);
			this._data.setInt8(this.offset++, value);
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as an 8-bit unsigned integer and move pointer forward by 1
		* byte.
		* @param value - The value to write.
		* @returns This.
		*/
		writeUint8(value) {
			this.ensureAvailable(1);
			this._data.setUint8(this.offset++, value);
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* An alias for {@link IOBuffer#writeUint8}.
		* @param value - The value to write.
		* @returns This.
		*/
		writeByte(value) {
			return this.writeUint8(value);
		}
		/**
		* Write all elements of `bytes` as uint8 values and move pointer forward by
		* `bytes.length` bytes.
		* @param bytes - The array of bytes to write.
		* @returns This.
		*/
		writeBytes(bytes) {
			this.ensureAvailable(bytes.length);
			for (let i = 0; i < bytes.length; i++) this._data.setUint8(this.offset++, bytes[i]);
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 16-bit signed integer and move pointer forward by 2
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeInt16(value) {
			this.ensureAvailable(2);
			this._data.setInt16(this.offset, value, this.littleEndian);
			this.offset += 2;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 16-bit unsigned integer and move pointer forward by 2
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeUint16(value) {
			this.ensureAvailable(2);
			this._data.setUint16(this.offset, value, this.littleEndian);
			this.offset += 2;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 32-bit signed integer and move pointer forward by 4
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeInt32(value) {
			this.ensureAvailable(4);
			this._data.setInt32(this.offset, value, this.littleEndian);
			this.offset += 4;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 32-bit unsigned integer and move pointer forward by 4
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeUint32(value) {
			this.ensureAvailable(4);
			this._data.setUint32(this.offset, value, this.littleEndian);
			this.offset += 4;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 32-bit floating number and move pointer forward by 4
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeFloat32(value) {
			this.ensureAvailable(4);
			this._data.setFloat32(this.offset, value, this.littleEndian);
			this.offset += 4;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 64-bit floating number and move pointer forward by 8
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeFloat64(value) {
			this.ensureAvailable(8);
			this._data.setFloat64(this.offset, value, this.littleEndian);
			this.offset += 8;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 64-bit signed bigint and move pointer forward by 8
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeBigInt64(value) {
			this.ensureAvailable(8);
			this._data.setBigInt64(this.offset, value, this.littleEndian);
			this.offset += 8;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write `value` as a 64-bit unsigned bigint and move pointer forward by 8
		* bytes.
		* @param value - The value to write.
		* @returns This.
		*/
		writeBigUint64(value) {
			this.ensureAvailable(8);
			this._data.setBigUint64(this.offset, value, this.littleEndian);
			this.offset += 8;
			this._updateLastWrittenByte();
			return this;
		}
		/**
		* Write the charCode of `str`'s first character as an 8-bit unsigned integer
		* and move pointer forward by 1 byte.
		* @param str - The character to write.
		* @returns This.
		*/
		writeChar(str) {
			return this.writeUint8(str.charCodeAt(0));
		}
		/**
		* Write the charCodes of all `str`'s characters as 8-bit unsigned integers
		* and move pointer forward by `str.length` bytes.
		* @param str - The characters to write.
		* @returns This.
		*/
		writeChars(str) {
			for (let i = 0; i < str.length; i++) this.writeUint8(str.charCodeAt(i));
			return this;
		}
		/**
		* UTF-8 encode and write `str` to the current pointer offset and move pointer
		* forward according to the encoded length.
		* @param str - The string to write.
		* @returns This.
		*/
		writeUtf8(str) {
			return this.writeBytes(encode(str));
		}
		/**
		* Export a Uint8Array view of the internal buffer.
		* The view starts at the byte offset and its length
		* is calculated to stop at the last written byte or the original length.
		* @returns A new Uint8Array view.
		*/
		toArray() {
			return new Uint8Array(this.buffer, this.byteOffset, this.lastWrittenByte);
		}
		/**
		*  Get the total number of bytes written so far, regardless of the current offset.
		* @returns - Total number of bytes.
		*/
		getWrittenByteLength() {
			return this.lastWrittenByte - this.byteOffset;
		}
		/**
		* Update the last written byte offset
		* @private
		*/
		_updateLastWrittenByte() {
			if (this.offset > this.lastWrittenByte) this.lastWrittenByte = this.offset;
		}
	};
}));
//#endregion
//#region node_modules/pako/dist/pako.esm.mjs
/*! pako 2.2.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */
function zero$1(buf) {
	let len = buf.length;
	while (--len >= 0) buf[len] = 0;
}
function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
	this.static_tree = static_tree;
	this.extra_bits = extra_bits;
	this.extra_base = extra_base;
	this.elems = elems;
	this.max_length = max_length;
	this.has_stree = static_tree && static_tree.length;
}
function TreeDesc(dyn_tree, stat_desc) {
	this.dyn_tree = dyn_tree;
	this.max_code = 0;
	this.stat_desc = stat_desc;
}
function Config(good_length, max_lazy, nice_length, max_chain, func) {
	this.good_length = good_length;
	this.max_lazy = max_lazy;
	this.nice_length = nice_length;
	this.max_chain = max_chain;
	this.func = func;
}
function DeflateState() {
	this.strm = null;
	this.status = 0;
	this.pending_buf = null;
	this.pending_buf_size = 0;
	this.pending_out = 0;
	this.pending = 0;
	this.wrap = 0;
	this.gzhead = null;
	this.gzindex = 0;
	this.method = Z_DEFLATED$2;
	this.last_flush = -1;
	this.w_size = 0;
	this.w_bits = 0;
	this.w_mask = 0;
	this.window = null;
	this.window_size = 0;
	this.prev = null;
	this.head = null;
	this.ins_h = 0;
	this.legacy_hash = 0;
	this.hash_size = 0;
	this.hash_bits = 0;
	this.hash_mask = 0;
	this.hash_shift = 0;
	this.block_start = 0;
	this.match_length = 0;
	this.prev_match = 0;
	this.match_available = 0;
	this.strstart = 0;
	this.match_start = 0;
	this.lookahead = 0;
	this.prev_length = 0;
	this.max_chain_length = 0;
	this.max_lazy_match = 0;
	this.level = 0;
	this.strategy = 0;
	this.good_match = 0;
	this.nice_match = 0;
	this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
	this.dyn_dtree = /* @__PURE__ */ new Uint16Array(122);
	this.bl_tree = /* @__PURE__ */ new Uint16Array(78);
	zero(this.dyn_ltree);
	zero(this.dyn_dtree);
	zero(this.bl_tree);
	this.l_desc = null;
	this.d_desc = null;
	this.bl_desc = null;
	this.bl_count = /* @__PURE__ */ new Uint16Array(16);
	this.heap = /* @__PURE__ */ new Uint16Array(573);
	zero(this.heap);
	this.heap_len = 0;
	this.heap_max = 0;
	this.depth = /* @__PURE__ */ new Uint16Array(573);
	zero(this.depth);
	this.sym_buf = 0;
	this.lit_bufsize = 0;
	this.sym_next = 0;
	this.sym_end = 0;
	this.opt_len = 0;
	this.static_len = 0;
	this.matches = 0;
	this.insert = 0;
	this.bi_buf = 0;
	this.bi_valid = 0;
}
function ZStream() {
	this.input = null;
	this.next_in = 0;
	this.avail_in = 0;
	this.total_in = 0;
	this.output = null;
	this.next_out = 0;
	this.avail_out = 0;
	this.total_out = 0;
	this.msg = "";
	this.state = null;
	this.data_type = 2;
	this.adler = 0;
}
/**
* class Deflate
*
* Generic JS-style wrapper for zlib calls. If you don't need
* streaming behaviour - use more simple functions: [[deflate]],
* [[deflateRaw]] and [[gzip]].
**/
/**
* Deflate.result -> Uint8Array
*
* Compressed result, generated by default [[Deflate#onData]]
* and [[Deflate#onEnd]] handlers. Filled after you push last chunk
* (call [[Deflate#push]] with `Z_FINISH` / `true` param).
**/
/**
* Deflate.err -> Number
*
* Error code after deflate finished. 0 (Z_OK) on success.
* You will not need it in real life, because deflate errors
* are possible only on wrong options or bad `onData` / `onEnd`
* custom handlers.
**/
/**
* Deflate.msg -> String
*
* Error message, if [[Deflate.err]] != 0
**/
/**
* new Deflate(options)
* - options (Object): zlib deflate options.
*
* Creates new deflator instance with specified params. Throws exception
* on bad params. Supported options:
*
* - `level`
* - `windowBits`
* - `memLevel`
* - `strategy`
* - `dictionary`
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* - `legacyHash` (Boolean) - use the classic zlib hash (default), which matches
*   canonical zlib output byte-for-byte. Set to `false` to use the faster
*   ANZAC++ hash, which matches recent (chromium) node.js output instead.
*
* Additional options, for internal needs:
*
* - `chunkSize` - size of generated data chunks (16K by default)
* - `raw` (Boolean) - do raw deflate
* - `gzip` (Boolean) - create gzip wrapper
* - `header` (Object) - custom header for gzip
*   - `text` (Boolean) - true if compressed data believed to be text
*   - `time` (Number) - modification time, unix timestamp
*   - `os` (Number) - operation system code
*   - `extra` (Array) - array of bytes with extra data (max 65536)
*   - `name` (String) - file name (binary string)
*   - `comment` (String) - comment (binary string)
*   - `hcrc` (Boolean) - true if header crc should be added
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
*   , chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
*   , chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
*
* const deflate = new pako.Deflate({ level: 3});
*
* deflate.push(chunk1, false);
* deflate.push(chunk2, true);  // true -> last chunk
*
* if (deflate.err) { throw new Error(deflate.err); }
*
* console.log(deflate.result);
* ```
**/
function Deflate$1(options) {
	this.options = common.assign({}, defaultOptions$1, options || {});
	let opt = this.options;
	if (opt.raw && opt.windowBits > 0) opt.windowBits = -opt.windowBits;
	else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) opt.windowBits += 16;
	this.err = 0;
	this.msg = "";
	this.ended = false;
	this.chunks = [];
	this.strm = new zstream();
	this.strm.avail_out = 0;
	let status = deflate_1$2.deflateInit2(this.strm, opt.level, opt.method, opt.windowBits, opt.memLevel, opt.strategy, opt.legacyHash);
	if (status !== Z_OK$2) throw new Error(messages[status]);
	if (opt.header) deflate_1$2.deflateSetHeader(this.strm, opt.header);
	if (opt.dictionary) {
		let dict;
		if (typeof opt.dictionary === "string") dict = strings.string2buf(opt.dictionary);
		else if (toString$1.call(opt.dictionary) === "[object ArrayBuffer]") dict = new Uint8Array(opt.dictionary);
		else dict = opt.dictionary;
		status = deflate_1$2.deflateSetDictionary(this.strm, dict);
		if (status !== Z_OK$2) throw new Error(messages[status]);
		this._dict_set = true;
	}
}
/**
* deflate(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* Compress `data` with deflate algorithm and `options`.
*
* Supported options are:
*
* - level
* - windowBits
* - memLevel
* - strategy
* - dictionary
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* Sugar (options):
*
* - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
*   negative windowBits implicitly.
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
* const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
*
* console.log(pako.deflate(data));
* ```
**/
function deflate$1(input, options) {
	const deflator = new Deflate$1(options);
	deflator.push(input, true);
	if (deflator.err) throw deflator.msg || messages[deflator.err];
	return deflator.result;
}
/**
* deflateRaw(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* The same as [[deflate]], but creates raw data, without wrapper
* (header and adler32 crc).
**/
function deflateRaw$1(input, options) {
	options = options || {};
	options.raw = true;
	return deflate$1(input, options);
}
/**
* gzip(data[, options]) -> Uint8Array
* - data (Uint8Array|ArrayBuffer|String): input data to compress.
* - options (Object): zlib deflate options.
*
* The same as [[deflate]], but create gzip wrapper instead of
* deflate one.
**/
function gzip$1(input, options) {
	options = options || {};
	options.gzip = true;
	return deflate$1(input, options);
}
function InflateState() {
	this.strm = null;
	this.mode = 0;
	this.last = false;
	this.wrap = 0;
	this.havedict = false;
	this.flags = 0;
	this.dmax = 0;
	this.check = 0;
	this.total = 0;
	this.head = null;
	this.wbits = 0;
	this.wsize = 0;
	this.whave = 0;
	this.wnext = 0;
	this.window = null;
	this.hold = 0;
	this.bits = 0;
	this.length = 0;
	this.offset = 0;
	this.extra = 0;
	this.lencode = null;
	this.distcode = null;
	this.lenbits = 0;
	this.distbits = 0;
	this.ncode = 0;
	this.nlen = 0;
	this.ndist = 0;
	this.have = 0;
	this.next = null;
	this.lens = /* @__PURE__ */ new Uint16Array(320);
	this.work = /* @__PURE__ */ new Uint16Array(288);
	this.lendyn = null;
	this.distdyn = null;
	this.sane = 0;
	this.back = 0;
	this.was = 0;
}
function GZheader() {
	this.text = 0;
	this.time = 0;
	this.xflags = 0;
	this.os = 0;
	this.extra = null;
	this.extra_len = 0;
	this.name = "";
	this.comment = "";
	this.hcrc = 0;
	this.done = false;
}
/**
* class Inflate
*
* Generic JS-style wrapper for zlib calls. If you don't need
* streaming behaviour - use more simple functions: [[inflate]]
* and [[inflateRaw]].
**/
/**
* Inflate.result -> Uint8Array|String
*
* Uncompressed result, generated by default [[Inflate#onData]]
* and [[Inflate#onEnd]] handlers. Filled after you push last chunk
* (call [[Inflate#push]] with `Z_FINISH` / `true` param).
**/
/**
* Inflate.err -> Number
*
* Error code after inflate finished. 0 (Z_OK) on success.
* Should be checked if broken data possible.
**/
/**
* Inflate.msg -> String
*
* Error message, if [[Inflate.err]] != 0
**/
/**
* new Inflate(options)
* - options (Object): zlib inflate options.
*
* Creates new inflator instance with specified params. Throws exception
* on bad params. Supported options:
*
* - `windowBits`
* - `dictionary`
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information on these.
*
* Additional options, for internal needs:
*
* - `chunkSize` - size of generated data chunks (16K by default)
* - `raw` (Boolean) - do raw inflate
* - `to` (String) - if equal to 'string', then result will be converted
*   from utf8 to utf16 (javascript) string. When string output requested,
*   chunk length can differ from `chunkSize`, depending on content.
*
* By default, when no options set, autodetect deflate/gzip data format via
* wrapper header.
*
* ##### Example:
*
* ```javascript
* const pako = require('pako')
* const chunk1 = new Uint8Array([1,2,3,4,5,6,7,8,9])
* const chunk2 = new Uint8Array([10,11,12,13,14,15,16,17,18,19]);
*
* const inflate = new pako.Inflate({ level: 3});
*
* inflate.push(chunk1, false);
* inflate.push(chunk2, true);  // true -> last chunk
*
* if (inflate.err) { throw new Error(inflate.err); }
*
* console.log(inflate.result);
* ```
**/
function Inflate$1(options) {
	this.options = common.assign({}, defaultOptions, options || {});
	const opt = this.options;
	if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
		opt.windowBits = -opt.windowBits;
		if (opt.windowBits === 0) opt.windowBits = -15;
	}
	if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) opt.windowBits += 32;
	if (opt.windowBits > 15 && opt.windowBits < 48) {
		if ((opt.windowBits & 15) === 0) opt.windowBits |= 15;
	}
	this.err = 0;
	this.msg = "";
	this.ended = false;
	this.chunks = [];
	this.strm = new zstream();
	this.strm.avail_out = 0;
	let status = inflate_1$2.inflateInit2(this.strm, opt.windowBits);
	if (status !== Z_OK) throw new Error(messages[status]);
	this.header = new gzheader();
	inflate_1$2.inflateGetHeader(this.strm, this.header);
	if (opt.dictionary) {
		if (typeof opt.dictionary === "string") opt.dictionary = strings.string2buf(opt.dictionary);
		else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") opt.dictionary = new Uint8Array(opt.dictionary);
		if (opt.raw) {
			status = inflate_1$2.inflateSetDictionary(this.strm, opt.dictionary);
			if (status !== Z_OK) throw new Error(messages[status]);
		}
	}
}
/**
* inflate(data[, options]) -> Uint8Array|String
* - data (Uint8Array|ArrayBuffer): input data to decompress.
* - options (Object): zlib inflate options.
*
* Decompress `data` with inflate/ungzip and `options`. Autodetect
* format via wrapper header by default. That's why we don't provide
* separate `ungzip` method.
*
* Supported options are:
*
* - windowBits
*
* [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
* for more information.
*
* Sugar (options):
*
* - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
*   negative windowBits implicitly.
* - `to` (String) - if equal to 'string', then result will be converted
*   from utf8 to utf16 (javascript) string. When string output requested,
*   chunk length can differ from `chunkSize`, depending on content.
*
*
* ##### Example:
*
* ```javascript
* const pako = require('pako');
* const input = pako.deflate(new Uint8Array([1,2,3,4,5,6,7,8,9]));
* let output;
*
* try {
*   output = pako.inflate(input);
* } catch (err) {
*   console.log(err);
* }
* ```
**/
function inflate$1(input, options) {
	const inflator = new Inflate$1(options);
	inflator.push(input, true);
	if (inflator.err) throw inflator.msg || messages[inflator.err];
	return inflator.result;
}
/**
* inflateRaw(data[, options]) -> Uint8Array|String
* - data (Uint8Array|ArrayBuffer): input data to decompress.
* - options (Object): zlib inflate options.
*
* The same as [[inflate]], but creates raw data, without wrapper
* (header and adler32 crc).
**/
function inflateRaw$1(input, options) {
	options = options || {};
	options.raw = true;
	return inflate$1(input, options);
}
var Z_FIXED$1, Z_BINARY, Z_TEXT, Z_UNKNOWN$1, LENGTH_CODES$1, LITERALS$1, L_CODES$1, D_CODES$1, BL_CODES$1, HEAP_SIZE$1, MAX_BITS$1, Buf_size, MAX_BL_BITS, END_BLOCK, REP_3_6, REPZ_3_10, REPZ_11_138, extra_lbits, extra_dbits, extra_blbits, bl_order, DIST_CODE_LEN, static_ltree, static_dtree, _dist_code, _length_code, base_length, base_dist, static_l_desc, static_d_desc, static_bl_desc, d_code, put_short, send_bits, send_code, bi_reverse, bi_flush, gen_bitlen, gen_codes, tr_static_init, init_block, bi_windup, smaller, pqdownheap, compress_block, build_tree, scan_tree, send_tree, build_bl_tree, send_all_trees, detect_data_type, static_init_done, _tr_init$1, _tr_stored_block$1, _tr_align$1, _tr_flush_block$1, _tr_tally$1, trees, adler32, adler32_1, makeTable, crcTable$1, crc32, crc32_1, messages, constants$2, _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align, Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH$1, Z_FINISH$3, Z_BLOCK$1, Z_OK$3, Z_STREAM_END$3, Z_STREAM_ERROR$2, Z_DATA_ERROR$2, Z_BUF_ERROR$2, Z_DEFAULT_COMPRESSION$1, Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY$1, Z_UNKNOWN, Z_DEFLATED$2, MAX_MEM_LEVEL, MAX_WBITS$1, DEF_MEM_LEVEL, HEAP_SIZE, MIN_MATCH, MAX_MATCH, MIN_LOOKAHEAD, PRESET_DICT, INIT_STATE, GZIP_STATE, EXTRA_STATE, NAME_STATE, COMMENT_STATE, HCRC_STATE, BUSY_STATE, FINISH_STATE, BS_NEED_MORE, BS_BLOCK_DONE, BS_FINISH_STARTED, BS_FINISH_DONE, OS_CODE, err, rank, zero, slide_hash, HASH, INSERT_STRING, flush_pending, flush_block_only, put_byte, putShortMSB, read_buf, longest_match, fill_window, deflate_stored, deflate_fast, deflate_slow, deflate_rle, deflate_huff, configuration_table, lm_init, deflateStateCheck, deflateResetKeep, deflateReset, deflateSetHeader, deflateInit2, deflateInit, deflate$2, deflateEnd, deflateSetDictionary, deflate_1$2, _has, assign, flattenChunks, common, STR_APPLY_UIA_OK, _utf8len, string2buf, buf2binstring, buf2string, utf8border, strings, zstream, toString$1, Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH$2, Z_OK$2, Z_STREAM_END$2, Z_DEFAULT_COMPRESSION, Z_DEFAULT_STRATEGY, Z_DEFLATED$1, defaultOptions$1, deflate_1$1, BAD$1, TYPE$1, inffast, MAXBITS, ENOUGH_LENS$1, ENOUGH_DISTS$1, CODES$1, LENS$1, DISTS$1, lbase, lext, dbase, dext, inflate_table, inftrees, CODES, LENS, DISTS, Z_FINISH$1, Z_BLOCK, Z_TREES, Z_OK$1, Z_STREAM_END$1, Z_NEED_DICT$1, Z_STREAM_ERROR$1, Z_DATA_ERROR$1, Z_MEM_ERROR$1, Z_BUF_ERROR$1, Z_DEFLATED, HEAD, FLAGS, TIME, OS, EXLEN, EXTRA, NAME, COMMENT, HCRC, DICTID, DICT, TYPE, TYPEDO, STORED, COPY_, COPY, TABLE, LENLENS, CODELENS, LEN_, LEN, LENEXT, DIST, DISTEXT, MATCH, LIT, CHECK, LENGTH, DONE, BAD, MEM, SYNC, ENOUGH_LENS, ENOUGH_DISTS, DEF_WBITS, zswap32, inflateStateCheck, inflateResetKeep, inflateReset, inflateReset2, inflateInit2, inflateInit, virgin, lenfix, distfix, fixedtables, updatewindow, inflate$2, inflateEnd, inflateGetHeader, inflateSetDictionary, inflate_1$2, gzheader, toString, Z_NO_FLUSH, Z_FINISH, Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR, Z_BUF_ERROR, defaultOptions, inflate_1$1, Deflate, deflate, deflateRaw, gzip, Inflate, inflate, inflateRaw, ungzip, deflate_1, Inflate_1, inflate_1;
var init_pako_esm = __esmMin((() => {
	Z_FIXED$1 = 4;
	Z_BINARY = 0;
	Z_TEXT = 1;
	Z_UNKNOWN$1 = 2;
	LENGTH_CODES$1 = 29;
	LITERALS$1 = 256;
	L_CODES$1 = 286;
	D_CODES$1 = 30;
	BL_CODES$1 = 19;
	HEAP_SIZE$1 = 573;
	MAX_BITS$1 = 15;
	Buf_size = 16;
	MAX_BL_BITS = 7;
	END_BLOCK = 256;
	REP_3_6 = 16;
	REPZ_3_10 = 17;
	REPZ_11_138 = 18;
	extra_lbits = new Uint8Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		1,
		1,
		1,
		1,
		2,
		2,
		2,
		2,
		3,
		3,
		3,
		3,
		4,
		4,
		4,
		4,
		5,
		5,
		5,
		5,
		0
	]);
	extra_dbits = new Uint8Array([
		0,
		0,
		0,
		0,
		1,
		1,
		2,
		2,
		3,
		3,
		4,
		4,
		5,
		5,
		6,
		6,
		7,
		7,
		8,
		8,
		9,
		9,
		10,
		10,
		11,
		11,
		12,
		12,
		13,
		13
	]);
	extra_blbits = new Uint8Array([
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		2,
		3,
		7
	]);
	bl_order = new Uint8Array([
		16,
		17,
		18,
		0,
		8,
		7,
		9,
		6,
		10,
		5,
		11,
		4,
		12,
		3,
		13,
		2,
		14,
		1,
		15
	]);
	DIST_CODE_LEN = 512;
	static_ltree = new Array(576);
	zero$1(static_ltree);
	static_dtree = new Array(60);
	zero$1(static_dtree);
	_dist_code = new Array(DIST_CODE_LEN);
	zero$1(_dist_code);
	_length_code = new Array(256);
	zero$1(_length_code);
	base_length = new Array(LENGTH_CODES$1);
	zero$1(base_length);
	base_dist = new Array(D_CODES$1);
	zero$1(base_dist);
	d_code = (dist) => {
		return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
	};
	put_short = (s, w) => {
		s.pending_buf[s.pending++] = w & 255;
		s.pending_buf[s.pending++] = w >>> 8 & 255;
	};
	send_bits = (s, value, length) => {
		if (s.bi_valid > Buf_size - length) {
			s.bi_buf |= value << s.bi_valid & 65535;
			put_short(s, s.bi_buf);
			s.bi_buf = value >> Buf_size - s.bi_valid;
			s.bi_valid += length - Buf_size;
		} else {
			s.bi_buf |= value << s.bi_valid & 65535;
			s.bi_valid += length;
		}
	};
	send_code = (s, c, tree) => {
		send_bits(s, tree[c * 2], tree[c * 2 + 1]);
	};
	bi_reverse = (code, len) => {
		let res = 0;
		do {
			res |= code & 1;
			code >>>= 1;
			res <<= 1;
		} while (--len > 0);
		return res >>> 1;
	};
	bi_flush = (s) => {
		if (s.bi_valid === 16) {
			put_short(s, s.bi_buf);
			s.bi_buf = 0;
			s.bi_valid = 0;
		} else if (s.bi_valid >= 8) {
			s.pending_buf[s.pending++] = s.bi_buf & 255;
			s.bi_buf >>= 8;
			s.bi_valid -= 8;
		}
	};
	gen_bitlen = (s, desc) => {
		const tree = desc.dyn_tree;
		const max_code = desc.max_code;
		const stree = desc.stat_desc.static_tree;
		const has_stree = desc.stat_desc.has_stree;
		const extra = desc.stat_desc.extra_bits;
		const base = desc.stat_desc.extra_base;
		const max_length = desc.stat_desc.max_length;
		let h;
		let n, m;
		let bits;
		let xbits;
		let f;
		let overflow = 0;
		for (bits = 0; bits <= MAX_BITS$1; bits++) s.bl_count[bits] = 0;
		tree[s.heap[s.heap_max] * 2 + 1] = 0;
		for (h = s.heap_max + 1; h < HEAP_SIZE$1; h++) {
			n = s.heap[h];
			bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
			if (bits > max_length) {
				bits = max_length;
				overflow++;
			}
			tree[n * 2 + 1] = bits;
			if (n > max_code) continue;
			s.bl_count[bits]++;
			xbits = 0;
			if (n >= base) xbits = extra[n - base];
			f = tree[n * 2];
			s.opt_len += f * (bits + xbits);
			if (has_stree) s.static_len += f * (stree[n * 2 + 1] + xbits);
		}
		if (overflow === 0) return;
		do {
			bits = max_length - 1;
			while (s.bl_count[bits] === 0) bits--;
			s.bl_count[bits]--;
			s.bl_count[bits + 1] += 2;
			s.bl_count[max_length]--;
			overflow -= 2;
		} while (overflow > 0);
		for (bits = max_length; bits !== 0; bits--) {
			n = s.bl_count[bits];
			while (n !== 0) {
				m = s.heap[--h];
				if (m > max_code) continue;
				if (tree[m * 2 + 1] !== bits) {
					s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
					tree[m * 2 + 1] = bits;
				}
				n--;
			}
		}
	};
	gen_codes = (tree, max_code, bl_count) => {
		const next_code = new Array(16);
		let code = 0;
		let bits;
		let n;
		for (bits = 1; bits <= MAX_BITS$1; bits++) {
			code = code + bl_count[bits - 1] << 1;
			next_code[bits] = code;
		}
		for (n = 0; n <= max_code; n++) {
			let len = tree[n * 2 + 1];
			if (len === 0) continue;
			tree[n * 2] = bi_reverse(next_code[len]++, len);
		}
	};
	tr_static_init = () => {
		let n;
		let bits;
		let length;
		let code;
		let dist;
		const bl_count = new Array(16);
		length = 0;
		for (code = 0; code < 28; code++) {
			base_length[code] = length;
			for (n = 0; n < 1 << extra_lbits[code]; n++) _length_code[length++] = code;
		}
		_length_code[length - 1] = code;
		dist = 0;
		for (code = 0; code < 16; code++) {
			base_dist[code] = dist;
			for (n = 0; n < 1 << extra_dbits[code]; n++) _dist_code[dist++] = code;
		}
		dist >>= 7;
		for (; code < D_CODES$1; code++) {
			base_dist[code] = dist << 7;
			for (n = 0; n < 1 << extra_dbits[code] - 7; n++) _dist_code[256 + dist++] = code;
		}
		for (bits = 0; bits <= MAX_BITS$1; bits++) bl_count[bits] = 0;
		n = 0;
		while (n <= 143) {
			static_ltree[n * 2 + 1] = 8;
			n++;
			bl_count[8]++;
		}
		while (n <= 255) {
			static_ltree[n * 2 + 1] = 9;
			n++;
			bl_count[9]++;
		}
		while (n <= 279) {
			static_ltree[n * 2 + 1] = 7;
			n++;
			bl_count[7]++;
		}
		while (n <= 287) {
			static_ltree[n * 2 + 1] = 8;
			n++;
			bl_count[8]++;
		}
		gen_codes(static_ltree, 287, bl_count);
		for (n = 0; n < D_CODES$1; n++) {
			static_dtree[n * 2 + 1] = 5;
			static_dtree[n * 2] = bi_reverse(n, 5);
		}
		static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, 257, L_CODES$1, MAX_BITS$1);
		static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES$1, MAX_BITS$1);
		static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES$1, MAX_BL_BITS);
	};
	init_block = (s) => {
		let n;
		for (n = 0; n < L_CODES$1; n++) s.dyn_ltree[n * 2] = 0;
		for (n = 0; n < D_CODES$1; n++) s.dyn_dtree[n * 2] = 0;
		for (n = 0; n < BL_CODES$1; n++) s.bl_tree[n * 2] = 0;
		s.dyn_ltree[END_BLOCK * 2] = 1;
		s.opt_len = s.static_len = 0;
		s.sym_next = s.matches = 0;
	};
	bi_windup = (s) => {
		if (s.bi_valid > 8) put_short(s, s.bi_buf);
		else if (s.bi_valid > 0) s.pending_buf[s.pending++] = s.bi_buf;
		s.bi_buf = 0;
		s.bi_valid = 0;
	};
	smaller = (tree, n, m, depth) => {
		const _n2 = n * 2;
		const _m2 = m * 2;
		return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
	};
	pqdownheap = (s, tree, k) => {
		const v = s.heap[k];
		let j = k << 1;
		while (j <= s.heap_len) {
			if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) j++;
			if (smaller(tree, v, s.heap[j], s.depth)) break;
			s.heap[k] = s.heap[j];
			k = j;
			j <<= 1;
		}
		s.heap[k] = v;
	};
	compress_block = (s, ltree, dtree) => {
		let dist;
		let lc;
		let sx = 0;
		let code;
		let extra;
		if (s.sym_next !== 0) do {
			dist = s.pending_buf[s.sym_buf + sx++] & 255;
			dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
			lc = s.pending_buf[s.sym_buf + sx++];
			if (dist === 0) send_code(s, lc, ltree);
			else {
				code = _length_code[lc];
				send_code(s, code + LITERALS$1 + 1, ltree);
				extra = extra_lbits[code];
				if (extra !== 0) {
					lc -= base_length[code];
					send_bits(s, lc, extra);
				}
				dist--;
				code = d_code(dist);
				send_code(s, code, dtree);
				extra = extra_dbits[code];
				if (extra !== 0) {
					dist -= base_dist[code];
					send_bits(s, dist, extra);
				}
			}
		} while (sx < s.sym_next);
		send_code(s, END_BLOCK, ltree);
	};
	build_tree = (s, desc) => {
		const tree = desc.dyn_tree;
		const stree = desc.stat_desc.static_tree;
		const has_stree = desc.stat_desc.has_stree;
		const elems = desc.stat_desc.elems;
		let n, m;
		let max_code = -1;
		let node;
		s.heap_len = 0;
		s.heap_max = HEAP_SIZE$1;
		for (n = 0; n < elems; n++) if (tree[n * 2] !== 0) {
			s.heap[++s.heap_len] = max_code = n;
			s.depth[n] = 0;
		} else tree[n * 2 + 1] = 0;
		while (s.heap_len < 2) {
			node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
			tree[node * 2] = 1;
			s.depth[node] = 0;
			s.opt_len--;
			if (has_stree) s.static_len -= stree[node * 2 + 1];
		}
		desc.max_code = max_code;
		for (n = s.heap_len >> 1; n >= 1; n--) pqdownheap(s, tree, n);
		node = elems;
		do {
			/*** pqremove ***/
			n = s.heap[1];
			s.heap[1] = s.heap[s.heap_len--];
			pqdownheap(s, tree, 1);
			m = s.heap[1];
			s.heap[--s.heap_max] = n;
			s.heap[--s.heap_max] = m;
			tree[node * 2] = tree[n * 2] + tree[m * 2];
			s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
			tree[n * 2 + 1] = tree[m * 2 + 1] = node;
			s.heap[1] = node++;
			pqdownheap(s, tree, 1);
		} while (s.heap_len >= 2);
		s.heap[--s.heap_max] = s.heap[1];
		gen_bitlen(s, desc);
		gen_codes(tree, max_code, s.bl_count);
	};
	scan_tree = (s, tree, max_code) => {
		let n;
		let prevlen = -1;
		let curlen;
		let nextlen = tree[1];
		let count = 0;
		let max_count = 7;
		let min_count = 4;
		if (nextlen === 0) {
			max_count = 138;
			min_count = 3;
		}
		tree[(max_code + 1) * 2 + 1] = 65535;
		for (n = 0; n <= max_code; n++) {
			curlen = nextlen;
			nextlen = tree[(n + 1) * 2 + 1];
			if (++count < max_count && curlen === nextlen) continue;
			else if (count < min_count) s.bl_tree[curlen * 2] += count;
			else if (curlen !== 0) {
				if (curlen !== prevlen) s.bl_tree[curlen * 2]++;
				s.bl_tree[32]++;
			} else if (count <= 10) s.bl_tree[34]++;
			else s.bl_tree[36]++;
			count = 0;
			prevlen = curlen;
			if (nextlen === 0) {
				max_count = 138;
				min_count = 3;
			} else if (curlen === nextlen) {
				max_count = 6;
				min_count = 3;
			} else {
				max_count = 7;
				min_count = 4;
			}
		}
	};
	send_tree = (s, tree, max_code) => {
		let n;
		let prevlen = -1;
		let curlen;
		let nextlen = tree[1];
		let count = 0;
		let max_count = 7;
		let min_count = 4;
		if (nextlen === 0) {
			max_count = 138;
			min_count = 3;
		}
		for (n = 0; n <= max_code; n++) {
			curlen = nextlen;
			nextlen = tree[(n + 1) * 2 + 1];
			if (++count < max_count && curlen === nextlen) continue;
			else if (count < min_count) do
				send_code(s, curlen, s.bl_tree);
			while (--count !== 0);
			else if (curlen !== 0) {
				if (curlen !== prevlen) {
					send_code(s, curlen, s.bl_tree);
					count--;
				}
				send_code(s, REP_3_6, s.bl_tree);
				send_bits(s, count - 3, 2);
			} else if (count <= 10) {
				send_code(s, REPZ_3_10, s.bl_tree);
				send_bits(s, count - 3, 3);
			} else {
				send_code(s, REPZ_11_138, s.bl_tree);
				send_bits(s, count - 11, 7);
			}
			count = 0;
			prevlen = curlen;
			if (nextlen === 0) {
				max_count = 138;
				min_count = 3;
			} else if (curlen === nextlen) {
				max_count = 6;
				min_count = 3;
			} else {
				max_count = 7;
				min_count = 4;
			}
		}
	};
	build_bl_tree = (s) => {
		let max_blindex;
		scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
		scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
		build_tree(s, s.bl_desc);
		for (max_blindex = 18; max_blindex >= 3; max_blindex--) if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) break;
		s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
		return max_blindex;
	};
	send_all_trees = (s, lcodes, dcodes, blcodes) => {
		let rank;
		send_bits(s, lcodes - 257, 5);
		send_bits(s, dcodes - 1, 5);
		send_bits(s, blcodes - 4, 4);
		for (rank = 0; rank < blcodes; rank++) send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
		send_tree(s, s.dyn_ltree, lcodes - 1);
		send_tree(s, s.dyn_dtree, dcodes - 1);
	};
	detect_data_type = (s) => {
		let block_mask = 4093624447;
		let n;
		for (n = 0; n <= 31; n++, block_mask >>>= 1) if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) return Z_BINARY;
		if (s.dyn_ltree[18] !== 0 || s.dyn_ltree[20] !== 0 || s.dyn_ltree[26] !== 0) return Z_TEXT;
		for (n = 32; n < LITERALS$1; n++) if (s.dyn_ltree[n * 2] !== 0) return Z_TEXT;
		return Z_BINARY;
	};
	static_init_done = false;
	_tr_init$1 = (s) => {
		if (!static_init_done) {
			tr_static_init();
			static_init_done = true;
		}
		s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
		s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
		s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
		s.bi_buf = 0;
		s.bi_valid = 0;
		init_block(s);
	};
	_tr_stored_block$1 = (s, buf, stored_len, last) => {
		send_bits(s, 0 + (last ? 1 : 0), 3);
		bi_windup(s);
		put_short(s, stored_len);
		put_short(s, ~stored_len);
		if (stored_len) s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
		s.pending += stored_len;
	};
	_tr_align$1 = (s) => {
		send_bits(s, 2, 3);
		send_code(s, END_BLOCK, static_ltree);
		bi_flush(s);
	};
	_tr_flush_block$1 = (s, buf, stored_len, last) => {
		let opt_lenb, static_lenb;
		let max_blindex = 0;
		if (s.level > 0) {
			if (s.strm.data_type === Z_UNKNOWN$1) s.strm.data_type = detect_data_type(s);
			build_tree(s, s.l_desc);
			build_tree(s, s.d_desc);
			max_blindex = build_bl_tree(s);
			opt_lenb = s.opt_len + 3 + 7 >>> 3;
			static_lenb = s.static_len + 3 + 7 >>> 3;
			if (static_lenb <= opt_lenb) opt_lenb = static_lenb;
		} else opt_lenb = static_lenb = stored_len + 5;
		if (stored_len + 4 <= opt_lenb && buf !== -1) _tr_stored_block$1(s, buf, stored_len, last);
		else if (s.strategy === Z_FIXED$1 || static_lenb === opt_lenb) {
			send_bits(s, 2 + (last ? 1 : 0), 3);
			compress_block(s, static_ltree, static_dtree);
		} else {
			send_bits(s, 4 + (last ? 1 : 0), 3);
			send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
			compress_block(s, s.dyn_ltree, s.dyn_dtree);
		}
		init_block(s);
		if (last) bi_windup(s);
	};
	_tr_tally$1 = (s, dist, lc) => {
		s.pending_buf[s.sym_buf + s.sym_next++] = dist;
		s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
		s.pending_buf[s.sym_buf + s.sym_next++] = lc;
		if (dist === 0) s.dyn_ltree[lc * 2]++;
		else {
			s.matches++;
			dist--;
			s.dyn_ltree[(_length_code[lc] + LITERALS$1 + 1) * 2]++;
			s.dyn_dtree[d_code(dist) * 2]++;
		}
		return s.sym_next === s.sym_end;
	};
	trees = {
		_tr_init: _tr_init$1,
		_tr_stored_block: _tr_stored_block$1,
		_tr_flush_block: _tr_flush_block$1,
		_tr_tally: _tr_tally$1,
		_tr_align: _tr_align$1
	};
	adler32 = (adler, buf, len, pos) => {
		let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
		while (len !== 0) {
			n = len > 2e3 ? 2e3 : len;
			len -= n;
			do {
				s1 = s1 + buf[pos++] | 0;
				s2 = s2 + s1 | 0;
			} while (--n);
			s1 %= 65521;
			s2 %= 65521;
		}
		return s1 | s2 << 16 | 0;
	};
	adler32_1 = adler32;
	makeTable = () => {
		let c, table = [];
		for (var n = 0; n < 256; n++) {
			c = n;
			for (var k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
			table[n] = c;
		}
		return table;
	};
	crcTable$1 = new Uint32Array(makeTable());
	crc32 = (crc, buf, len, pos) => {
		const t = crcTable$1;
		const end = pos + len;
		crc ^= -1;
		for (let i = pos; i < end; i++) crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
		return crc ^ -1;
	};
	crc32_1 = crc32;
	messages = {
		2: "need dictionary",
		1: "stream end",
		0: "",
		"-1": "file error",
		"-2": "stream error",
		"-3": "data error",
		"-4": "insufficient memory",
		"-5": "buffer error",
		"-6": "incompatible version"
	};
	constants$2 = {
		Z_NO_FLUSH: 0,
		Z_PARTIAL_FLUSH: 1,
		Z_SYNC_FLUSH: 2,
		Z_FULL_FLUSH: 3,
		Z_FINISH: 4,
		Z_BLOCK: 5,
		Z_TREES: 6,
		Z_OK: 0,
		Z_STREAM_END: 1,
		Z_NEED_DICT: 2,
		Z_ERRNO: -1,
		Z_STREAM_ERROR: -2,
		Z_DATA_ERROR: -3,
		Z_MEM_ERROR: -4,
		Z_BUF_ERROR: -5,
		Z_NO_COMPRESSION: 0,
		Z_BEST_SPEED: 1,
		Z_BEST_COMPRESSION: 9,
		Z_DEFAULT_COMPRESSION: -1,
		Z_FILTERED: 1,
		Z_HUFFMAN_ONLY: 2,
		Z_RLE: 3,
		Z_FIXED: 4,
		Z_DEFAULT_STRATEGY: 0,
		Z_BINARY: 0,
		Z_TEXT: 1,
		Z_UNKNOWN: 2,
		Z_DEFLATED: 8
	};
	({_tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align} = trees);
	({Z_NO_FLUSH: Z_NO_FLUSH$2, Z_PARTIAL_FLUSH, Z_FULL_FLUSH: Z_FULL_FLUSH$1, Z_FINISH: Z_FINISH$3, Z_BLOCK: Z_BLOCK$1, Z_OK: Z_OK$3, Z_STREAM_END: Z_STREAM_END$3, Z_STREAM_ERROR: Z_STREAM_ERROR$2, Z_DATA_ERROR: Z_DATA_ERROR$2, Z_BUF_ERROR: Z_BUF_ERROR$2, Z_DEFAULT_COMPRESSION: Z_DEFAULT_COMPRESSION$1, Z_FILTERED, Z_HUFFMAN_ONLY, Z_RLE, Z_FIXED, Z_DEFAULT_STRATEGY: Z_DEFAULT_STRATEGY$1, Z_UNKNOWN, Z_DEFLATED: Z_DEFLATED$2} = constants$2);
	MAX_MEM_LEVEL = 9;
	MAX_WBITS$1 = 15;
	DEF_MEM_LEVEL = 8;
	HEAP_SIZE = 573;
	MIN_MATCH = 3;
	MAX_MATCH = 258;
	MIN_LOOKAHEAD = 262;
	PRESET_DICT = 32;
	INIT_STATE = 42;
	GZIP_STATE = 57;
	EXTRA_STATE = 69;
	NAME_STATE = 73;
	COMMENT_STATE = 91;
	HCRC_STATE = 103;
	BUSY_STATE = 113;
	FINISH_STATE = 666;
	BS_NEED_MORE = 1;
	BS_BLOCK_DONE = 2;
	BS_FINISH_STARTED = 3;
	BS_FINISH_DONE = 4;
	OS_CODE = 3;
	err = (strm, errorCode) => {
		strm.msg = messages[errorCode];
		return errorCode;
	};
	rank = (f) => {
		return f * 2 - (f > 4 ? 9 : 0);
	};
	zero = (buf) => {
		let len = buf.length;
		while (--len >= 0) buf[len] = 0;
	};
	slide_hash = (s) => {
		let n, m;
		let p;
		let wsize = s.w_size;
		n = s.hash_size;
		p = n;
		do {
			m = s.head[--p];
			s.head[p] = m >= wsize ? m - wsize : 0;
		} while (--n);
		n = wsize;
		p = n;
		do {
			m = s.prev[--p];
			s.prev[p] = m >= wsize ? m - wsize : 0;
		} while (--n);
	};
	HASH = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
	INSERT_STRING = (s, str) => {
		let h;
		if (s.legacy_hash) h = s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
		else {
			const w = s.window;
			const value = w[str] | w[str + 1] << 8 | w[str + 2] << 16 | w[str + 3] << 24;
			h = s.ins_h = Math.imul(value, 66521) + 66521 >>> 16 & s.hash_mask;
		}
		const hash_head = s.prev[str & s.w_mask] = s.head[h];
		s.head[h] = str;
		return hash_head;
	};
	flush_pending = (strm) => {
		const s = strm.state;
		let len = s.pending;
		if (len > strm.avail_out) len = strm.avail_out;
		if (len === 0) return;
		strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
		strm.next_out += len;
		s.pending_out += len;
		strm.total_out += len;
		strm.avail_out -= len;
		s.pending -= len;
		if (s.pending === 0) s.pending_out = 0;
	};
	flush_block_only = (s, last) => {
		_tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
		s.block_start = s.strstart;
		flush_pending(s.strm);
	};
	put_byte = (s, b) => {
		s.pending_buf[s.pending++] = b;
	};
	putShortMSB = (s, b) => {
		s.pending_buf[s.pending++] = b >>> 8 & 255;
		s.pending_buf[s.pending++] = b & 255;
	};
	read_buf = (strm, buf, start, size) => {
		let len = strm.avail_in;
		if (len > size) len = size;
		if (len === 0) return 0;
		strm.avail_in -= len;
		buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
		if (strm.state.wrap === 1) strm.adler = adler32_1(strm.adler, buf, len, start);
		else if (strm.state.wrap === 2) strm.adler = crc32_1(strm.adler, buf, len, start);
		strm.next_in += len;
		strm.total_in += len;
		return len;
	};
	longest_match = (s, cur_match) => {
		let chain_length = s.max_chain_length;
		let scan = s.strstart;
		let match;
		let len;
		let best_len = s.prev_length;
		let nice_match = s.nice_match;
		const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
		const _win = s.window;
		const wmask = s.w_mask;
		const prev = s.prev;
		const strend = s.strstart + MAX_MATCH;
		let scan_end1 = _win[scan + best_len - 1];
		let scan_end = _win[scan + best_len];
		if (s.prev_length >= s.good_match) chain_length >>= 2;
		if (nice_match > s.lookahead) nice_match = s.lookahead;
		do {
			match = cur_match;
			if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) continue;
			scan += 2;
			match++;
			do			;
while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
			len = MAX_MATCH - (strend - scan);
			scan = strend - MAX_MATCH;
			if (len > best_len) {
				s.match_start = cur_match;
				best_len = len;
				if (len >= nice_match) break;
				scan_end1 = _win[scan + best_len - 1];
				scan_end = _win[scan + best_len];
			}
		} while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
		if (best_len <= s.lookahead) return best_len;
		return s.lookahead;
	};
	fill_window = (s) => {
		const _w_size = s.w_size;
		let n, more, str;
		do {
			more = s.window_size - s.lookahead - s.strstart;
			if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
				s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
				s.match_start -= _w_size;
				s.strstart -= _w_size;
				s.block_start -= _w_size;
				if (s.insert > s.strstart) s.insert = s.strstart;
				slide_hash(s);
				more += _w_size;
			}
			if (s.strm.avail_in === 0) break;
			n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
			s.lookahead += n;
			if (!s.legacy_hash) {
				if (s.lookahead + s.insert > MIN_MATCH) {
					str = s.strstart - s.insert;
					while (s.insert) {
						INSERT_STRING(s, str);
						str++;
						s.insert--;
						if (s.lookahead + s.insert <= MIN_MATCH) break;
					}
				}
			} else if (s.lookahead + s.insert >= MIN_MATCH) {
				str = s.strstart - s.insert;
				s.ins_h = s.window[str];
				s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
				while (s.insert) {
					INSERT_STRING(s, str);
					str++;
					s.insert--;
					if (s.lookahead + s.insert < MIN_MATCH) break;
				}
			}
		} while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
	};
	deflate_stored = (s, flush) => {
		let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
		let len, left, have, last = 0;
		let used = s.strm.avail_in;
		do {
			len = 65535;
			have = s.bi_valid + 42 >> 3;
			if (s.strm.avail_out < have) break;
			have = s.strm.avail_out - have;
			left = s.strstart - s.block_start;
			if (len > left + s.strm.avail_in) len = left + s.strm.avail_in;
			if (len > have) len = have;
			if (len < min_block && (len === 0 && flush !== Z_FINISH$3 || flush === Z_NO_FLUSH$2 || len !== left + s.strm.avail_in)) break;
			last = flush === Z_FINISH$3 && len === left + s.strm.avail_in ? 1 : 0;
			_tr_stored_block(s, 0, 0, last);
			s.pending_buf[s.pending - 4] = len;
			s.pending_buf[s.pending - 3] = len >> 8;
			s.pending_buf[s.pending - 2] = ~len;
			s.pending_buf[s.pending - 1] = ~len >> 8;
			flush_pending(s.strm);
			if (left) {
				if (left > len) left = len;
				s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
				s.strm.next_out += left;
				s.strm.avail_out -= left;
				s.strm.total_out += left;
				s.block_start += left;
				len -= left;
			}
			if (len) {
				read_buf(s.strm, s.strm.output, s.strm.next_out, len);
				s.strm.next_out += len;
				s.strm.avail_out -= len;
				s.strm.total_out += len;
			}
		} while (last === 0);
		used -= s.strm.avail_in;
		if (used) {
			if (used >= s.w_size) {
				s.matches = 2;
				s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
				s.strstart = s.w_size;
				s.insert = s.strstart;
			} else {
				if (s.window_size - s.strstart <= used) {
					s.strstart -= s.w_size;
					s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
					if (s.matches < 2) s.matches++;
					if (s.insert > s.strstart) s.insert = s.strstart;
				}
				s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
				s.strstart += used;
				s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
			}
			s.block_start = s.strstart;
		}
		if (s.high_water < s.strstart) s.high_water = s.strstart;
		if (last) return BS_FINISH_DONE;
		if (flush !== Z_NO_FLUSH$2 && flush !== Z_FINISH$3 && s.strm.avail_in === 0 && s.strstart === s.block_start) return BS_BLOCK_DONE;
		have = s.window_size - s.strstart;
		if (s.strm.avail_in > have && s.block_start >= s.w_size) {
			s.block_start -= s.w_size;
			s.strstart -= s.w_size;
			s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
			if (s.matches < 2) s.matches++;
			have += s.w_size;
			if (s.insert > s.strstart) s.insert = s.strstart;
		}
		if (have > s.strm.avail_in) have = s.strm.avail_in;
		if (have) {
			read_buf(s.strm, s.window, s.strstart, have);
			s.strstart += have;
			s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
		}
		if (s.high_water < s.strstart) s.high_water = s.strstart;
		have = s.bi_valid + 42 >> 3;
		have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
		min_block = have > s.w_size ? s.w_size : have;
		left = s.strstart - s.block_start;
		if (left >= min_block || (left || flush === Z_FINISH$3) && flush !== Z_NO_FLUSH$2 && s.strm.avail_in === 0 && left <= have) {
			len = left > have ? have : left;
			last = flush === Z_FINISH$3 && s.strm.avail_in === 0 && len === left ? 1 : 0;
			_tr_stored_block(s, s.block_start, len, last);
			s.block_start += len;
			flush_pending(s.strm);
		}
		return last ? BS_FINISH_STARTED : BS_NEED_MORE;
	};
	deflate_fast = (s, flush) => {
		let hash_head;
		let bflush;
		for (;;) {
			if (s.lookahead < MIN_LOOKAHEAD) {
				fill_window(s);
				if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
				if (s.lookahead === 0) break;
			}
			hash_head = 0;
			if (s.lookahead >= MIN_MATCH) hash_head = INSERT_STRING(s, s.strstart);
			if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) s.match_length = longest_match(s, hash_head);
			if (s.match_length >= MIN_MATCH) {
				/*** _tr_tally_dist(s, s.strstart - s.match_start,
				s.match_length - MIN_MATCH, bflush); ***/
				bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
				s.lookahead -= s.match_length;
				if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
					s.match_length--;
					do {
						s.strstart++;
						hash_head = INSERT_STRING(s, s.strstart);
					} while (--s.match_length !== 0);
					s.strstart++;
				} else {
					s.strstart += s.match_length;
					s.match_length = 0;
					if (s.legacy_hash) {
						s.ins_h = s.window[s.strstart];
						s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
					}
				}
			} else {
				/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
				bflush = _tr_tally(s, 0, s.window[s.strstart]);
				s.lookahead--;
				s.strstart++;
			}
			if (bflush) {
				/*** FLUSH_BLOCK(s, 0); ***/
				flush_block_only(s, false);
				if (s.strm.avail_out === 0) return BS_NEED_MORE;
			}
		}
		s.insert = s.strstart < 2 ? s.strstart : 2;
		if (flush === Z_FINISH$3) {
			/*** FLUSH_BLOCK(s, 1); ***/
			flush_block_only(s, true);
			if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
			return BS_FINISH_DONE;
		}
		if (s.sym_next) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
		return BS_BLOCK_DONE;
	};
	deflate_slow = (s, flush) => {
		let hash_head;
		let bflush;
		let max_insert;
		for (;;) {
			if (s.lookahead < MIN_LOOKAHEAD) {
				fill_window(s);
				if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
				if (s.lookahead === 0) break;
			}
			hash_head = 0;
			if (s.lookahead >= MIN_MATCH) hash_head = INSERT_STRING(s, s.strstart);
			s.prev_length = s.match_length;
			s.prev_match = s.match_start;
			s.match_length = 2;
			if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
				s.match_length = longest_match(s, hash_head);
				if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) s.match_length = 2;
			}
			if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
				max_insert = s.strstart + s.lookahead - MIN_MATCH;
				/***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
				s.prev_length - MIN_MATCH, bflush);***/
				bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
				s.lookahead -= s.prev_length - 1;
				s.prev_length -= 2;
				do
					if (++s.strstart <= max_insert) hash_head = INSERT_STRING(s, s.strstart);
				while (--s.prev_length !== 0);
				s.match_available = 0;
				s.match_length = 2;
				s.strstart++;
				if (bflush) {
					/*** FLUSH_BLOCK(s, 0); ***/
					flush_block_only(s, false);
					if (s.strm.avail_out === 0) return BS_NEED_MORE;
				}
			} else if (s.match_available) {
				/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
				bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
				if (bflush)
 /*** FLUSH_BLOCK_ONLY(s, 0) ***/
				flush_block_only(s, false);
				s.strstart++;
				s.lookahead--;
				if (s.strm.avail_out === 0) return BS_NEED_MORE;
			} else {
				s.match_available = 1;
				s.strstart++;
				s.lookahead--;
			}
		}
		if (s.match_available) {
			/*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
			bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
			s.match_available = 0;
		}
		s.insert = s.strstart < 2 ? s.strstart : 2;
		if (flush === Z_FINISH$3) {
			/*** FLUSH_BLOCK(s, 1); ***/
			flush_block_only(s, true);
			if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
			return BS_FINISH_DONE;
		}
		if (s.sym_next) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
		return BS_BLOCK_DONE;
	};
	deflate_rle = (s, flush) => {
		let bflush;
		let prev;
		let scan, strend;
		const _win = s.window;
		for (;;) {
			if (s.lookahead <= MAX_MATCH) {
				fill_window(s);
				if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
				if (s.lookahead === 0) break;
			}
			s.match_length = 0;
			if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
				scan = s.strstart - 1;
				prev = _win[scan];
				if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
					strend = s.strstart + MAX_MATCH;
					do					;
while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
					s.match_length = MAX_MATCH - (strend - scan);
					if (s.match_length > s.lookahead) s.match_length = s.lookahead;
				}
			}
			if (s.match_length >= MIN_MATCH) {
				/*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
				bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
				s.lookahead -= s.match_length;
				s.strstart += s.match_length;
				s.match_length = 0;
			} else {
				/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
				bflush = _tr_tally(s, 0, s.window[s.strstart]);
				s.lookahead--;
				s.strstart++;
			}
			if (bflush) {
				/*** FLUSH_BLOCK(s, 0); ***/
				flush_block_only(s, false);
				if (s.strm.avail_out === 0) return BS_NEED_MORE;
			}
		}
		s.insert = 0;
		if (flush === Z_FINISH$3) {
			/*** FLUSH_BLOCK(s, 1); ***/
			flush_block_only(s, true);
			if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
			return BS_FINISH_DONE;
		}
		if (s.sym_next) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
		return BS_BLOCK_DONE;
	};
	deflate_huff = (s, flush) => {
		let bflush;
		for (;;) {
			if (s.lookahead === 0) {
				fill_window(s);
				if (s.lookahead === 0) {
					if (flush === Z_NO_FLUSH$2) return BS_NEED_MORE;
					break;
				}
			}
			s.match_length = 0;
			/*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
			bflush = _tr_tally(s, 0, s.window[s.strstart]);
			s.lookahead--;
			s.strstart++;
			if (bflush) {
				/*** FLUSH_BLOCK(s, 0); ***/
				flush_block_only(s, false);
				if (s.strm.avail_out === 0) return BS_NEED_MORE;
			}
		}
		s.insert = 0;
		if (flush === Z_FINISH$3) {
			/*** FLUSH_BLOCK(s, 1); ***/
			flush_block_only(s, true);
			if (s.strm.avail_out === 0) return BS_FINISH_STARTED;
			return BS_FINISH_DONE;
		}
		if (s.sym_next) {
			/*** FLUSH_BLOCK(s, 0); ***/
			flush_block_only(s, false);
			if (s.strm.avail_out === 0) return BS_NEED_MORE;
		}
		return BS_BLOCK_DONE;
	};
	configuration_table = [
		new Config(0, 0, 0, 0, deflate_stored),
		new Config(4, 4, 8, 4, deflate_fast),
		new Config(4, 5, 16, 8, deflate_fast),
		new Config(4, 6, 32, 32, deflate_fast),
		new Config(4, 4, 16, 16, deflate_slow),
		new Config(8, 16, 32, 32, deflate_slow),
		new Config(8, 16, 128, 128, deflate_slow),
		new Config(8, 32, 128, 256, deflate_slow),
		new Config(32, 128, 258, 1024, deflate_slow),
		new Config(32, 258, 258, 4096, deflate_slow)
	];
	lm_init = (s) => {
		s.window_size = 2 * s.w_size;
		/*** CLEAR_HASH(s); ***/
		zero(s.head);
		s.max_lazy_match = configuration_table[s.level].max_lazy;
		s.good_match = configuration_table[s.level].good_length;
		s.nice_match = configuration_table[s.level].nice_length;
		s.max_chain_length = configuration_table[s.level].max_chain;
		s.strstart = 0;
		s.block_start = 0;
		s.lookahead = 0;
		s.insert = 0;
		s.match_length = s.prev_length = 2;
		s.match_available = 0;
		s.ins_h = 0;
	};
	deflateStateCheck = (strm) => {
		if (!strm) return 1;
		const s = strm.state;
		if (!s || s.strm !== strm || s.status !== INIT_STATE && s.status !== GZIP_STATE && s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) return 1;
		return 0;
	};
	deflateResetKeep = (strm) => {
		if (deflateStateCheck(strm)) return err(strm, Z_STREAM_ERROR$2);
		strm.total_in = strm.total_out = 0;
		strm.data_type = Z_UNKNOWN;
		const s = strm.state;
		s.pending = 0;
		s.pending_out = 0;
		if (s.wrap < 0) s.wrap = -s.wrap;
		s.status = s.wrap === 2 ? GZIP_STATE : s.wrap ? INIT_STATE : BUSY_STATE;
		strm.adler = s.wrap === 2 ? 0 : 1;
		s.last_flush = -2;
		_tr_init(s);
		return Z_OK$3;
	};
	deflateReset = (strm) => {
		const ret = deflateResetKeep(strm);
		if (ret === Z_OK$3) lm_init(strm.state);
		return ret;
	};
	deflateSetHeader = (strm, head) => {
		if (deflateStateCheck(strm) || strm.state.wrap !== 2) return Z_STREAM_ERROR$2;
		strm.state.gzhead = head;
		return Z_OK$3;
	};
	deflateInit2 = (strm, level, method, windowBits, memLevel, strategy, legacyHash) => {
		if (!strm) return Z_STREAM_ERROR$2;
		let wrap = 1;
		if (level === Z_DEFAULT_COMPRESSION$1) level = 6;
		if (windowBits < 0) {
			wrap = 0;
			windowBits = -windowBits;
		} else if (windowBits > 15) {
			wrap = 2;
			windowBits -= 16;
		}
		if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED$2 || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) return err(strm, Z_STREAM_ERROR$2);
		if (windowBits === 8) windowBits = 9;
		const s = new DeflateState();
		strm.state = s;
		s.strm = strm;
		s.status = INIT_STATE;
		s.wrap = wrap;
		s.gzhead = null;
		s.w_bits = windowBits;
		s.w_size = 1 << s.w_bits;
		s.w_mask = s.w_size - 1;
		s.legacy_hash = legacyHash ? 1 : 0;
		s.hash_bits = memLevel + 7;
		if (!s.legacy_hash && s.hash_bits < 15) s.hash_bits = 15;
		s.hash_size = 1 << s.hash_bits;
		s.hash_mask = s.hash_size - 1;
		s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
		s.window = new Uint8Array(s.w_size * 2);
		s.head = new Uint16Array(s.hash_size);
		s.prev = new Uint16Array(s.w_size);
		s.lit_bufsize = 1 << memLevel + 6;
		s.pending_buf_size = s.lit_bufsize * 4;
		s.pending_buf = new Uint8Array(s.pending_buf_size);
		s.sym_buf = s.lit_bufsize;
		s.sym_end = (s.lit_bufsize - 1) * 3;
		s.level = level;
		s.strategy = strategy;
		s.method = method;
		return deflateReset(strm);
	};
	deflateInit = (strm, level) => {
		return deflateInit2(strm, level, Z_DEFLATED$2, MAX_WBITS$1, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY$1);
	};
	deflate$2 = (strm, flush) => {
		if (deflateStateCheck(strm) || flush > Z_BLOCK$1 || flush < 0) return strm ? err(strm, Z_STREAM_ERROR$2) : Z_STREAM_ERROR$2;
		const s = strm.state;
		if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH$3) return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR$2 : Z_STREAM_ERROR$2);
		const old_flush = s.last_flush;
		s.last_flush = flush;
		if (s.pending !== 0) {
			flush_pending(strm);
			if (strm.avail_out === 0) {
				s.last_flush = -1;
				return Z_OK$3;
			}
		} else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH$3) return err(strm, Z_BUF_ERROR$2);
		if (s.status === FINISH_STATE && strm.avail_in !== 0) return err(strm, Z_BUF_ERROR$2);
		if (s.status === INIT_STATE && s.wrap === 0) s.status = BUSY_STATE;
		if (s.status === INIT_STATE) {
			let header = Z_DEFLATED$2 + (s.w_bits - 8 << 4) << 8;
			let level_flags = -1;
			if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) level_flags = 0;
			else if (s.level < 6) level_flags = 1;
			else if (s.level === 6) level_flags = 2;
			else level_flags = 3;
			header |= level_flags << 6;
			if (s.strstart !== 0) header |= PRESET_DICT;
			header += 31 - header % 31;
			putShortMSB(s, header);
			if (s.strstart !== 0) {
				putShortMSB(s, strm.adler >>> 16);
				putShortMSB(s, strm.adler & 65535);
			}
			strm.adler = 1;
			s.status = BUSY_STATE;
			flush_pending(strm);
			if (s.pending !== 0) {
				s.last_flush = -1;
				return Z_OK$3;
			}
		}
		if (s.status === GZIP_STATE) {
			strm.adler = 0;
			put_byte(s, 31);
			put_byte(s, 139);
			put_byte(s, 8);
			if (!s.gzhead) {
				put_byte(s, 0);
				put_byte(s, 0);
				put_byte(s, 0);
				put_byte(s, 0);
				put_byte(s, 0);
				put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
				put_byte(s, OS_CODE);
				s.status = BUSY_STATE;
				flush_pending(strm);
				if (s.pending !== 0) {
					s.last_flush = -1;
					return Z_OK$3;
				}
			} else {
				put_byte(s, (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16));
				put_byte(s, s.gzhead.time & 255);
				put_byte(s, s.gzhead.time >> 8 & 255);
				put_byte(s, s.gzhead.time >> 16 & 255);
				put_byte(s, s.gzhead.time >> 24 & 255);
				put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
				put_byte(s, s.gzhead.os & 255);
				if (s.gzhead.extra && s.gzhead.extra.length) {
					put_byte(s, s.gzhead.extra.length & 255);
					put_byte(s, s.gzhead.extra.length >> 8 & 255);
				}
				if (s.gzhead.hcrc) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending, 0);
				s.gzindex = 0;
				s.status = EXTRA_STATE;
			}
		}
		if (s.status === EXTRA_STATE) {
			if (s.gzhead.extra) {
				let beg = s.pending;
				let left = (s.gzhead.extra.length & 65535) - s.gzindex;
				while (s.pending + left > s.pending_buf_size) {
					let copy = s.pending_buf_size - s.pending;
					s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
					s.pending = s.pending_buf_size;
					if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
					s.gzindex += copy;
					flush_pending(strm);
					if (s.pending !== 0) {
						s.last_flush = -1;
						return Z_OK$3;
					}
					beg = 0;
					left -= copy;
				}
				let gzhead_extra = new Uint8Array(s.gzhead.extra);
				s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
				s.pending += left;
				if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
				s.gzindex = 0;
			}
			s.status = NAME_STATE;
		}
		if (s.status === NAME_STATE) {
			if (s.gzhead.name) {
				let beg = s.pending;
				let val;
				do {
					if (s.pending === s.pending_buf_size) {
						if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
						flush_pending(strm);
						if (s.pending !== 0) {
							s.last_flush = -1;
							return Z_OK$3;
						}
						beg = 0;
					}
					if (s.gzindex < s.gzhead.name.length) val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
					else val = 0;
					put_byte(s, val);
				} while (val !== 0);
				if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
				s.gzindex = 0;
			}
			s.status = COMMENT_STATE;
		}
		if (s.status === COMMENT_STATE) {
			if (s.gzhead.comment) {
				let beg = s.pending;
				let val;
				do {
					if (s.pending === s.pending_buf_size) {
						if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
						flush_pending(strm);
						if (s.pending !== 0) {
							s.last_flush = -1;
							return Z_OK$3;
						}
						beg = 0;
					}
					if (s.gzindex < s.gzhead.comment.length) val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
					else val = 0;
					put_byte(s, val);
				} while (val !== 0);
				if (s.gzhead.hcrc && s.pending > beg) strm.adler = crc32_1(strm.adler, s.pending_buf, s.pending - beg, beg);
			}
			s.status = HCRC_STATE;
		}
		if (s.status === HCRC_STATE) {
			if (s.gzhead.hcrc) {
				if (s.pending + 2 > s.pending_buf_size) {
					flush_pending(strm);
					if (s.pending !== 0) {
						s.last_flush = -1;
						return Z_OK$3;
					}
				}
				put_byte(s, strm.adler & 255);
				put_byte(s, strm.adler >> 8 & 255);
				strm.adler = 0;
			}
			s.status = BUSY_STATE;
			flush_pending(strm);
			if (s.pending !== 0) {
				s.last_flush = -1;
				return Z_OK$3;
			}
		}
		if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH$2 && s.status !== FINISH_STATE) {
			let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
			if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) s.status = FINISH_STATE;
			if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
				if (strm.avail_out === 0) s.last_flush = -1;
				return Z_OK$3;
			}
			if (bstate === BS_BLOCK_DONE) {
				if (flush === Z_PARTIAL_FLUSH) _tr_align(s);
				else if (flush !== Z_BLOCK$1) {
					_tr_stored_block(s, 0, 0, false);
					if (flush === Z_FULL_FLUSH$1) {
						/*** CLEAR_HASH(s); ***/ zero(s.head);
						if (s.lookahead === 0) {
							s.strstart = 0;
							s.block_start = 0;
							s.insert = 0;
						}
					}
				}
				flush_pending(strm);
				if (strm.avail_out === 0) {
					s.last_flush = -1;
					return Z_OK$3;
				}
			}
		}
		if (flush !== Z_FINISH$3) return Z_OK$3;
		if (s.wrap <= 0) return Z_STREAM_END$3;
		if (s.wrap === 2) {
			put_byte(s, strm.adler & 255);
			put_byte(s, strm.adler >> 8 & 255);
			put_byte(s, strm.adler >> 16 & 255);
			put_byte(s, strm.adler >> 24 & 255);
			put_byte(s, strm.total_in & 255);
			put_byte(s, strm.total_in >> 8 & 255);
			put_byte(s, strm.total_in >> 16 & 255);
			put_byte(s, strm.total_in >> 24 & 255);
		} else {
			putShortMSB(s, strm.adler >>> 16);
			putShortMSB(s, strm.adler & 65535);
		}
		flush_pending(strm);
		if (s.wrap > 0) s.wrap = -s.wrap;
		return s.pending !== 0 ? Z_OK$3 : Z_STREAM_END$3;
	};
	deflateEnd = (strm) => {
		if (deflateStateCheck(strm)) return Z_STREAM_ERROR$2;
		const status = strm.state.status;
		strm.state = null;
		return status === BUSY_STATE ? err(strm, Z_DATA_ERROR$2) : Z_OK$3;
	};
	deflateSetDictionary = (strm, dictionary) => {
		let dictLength = dictionary.length;
		if (deflateStateCheck(strm)) return Z_STREAM_ERROR$2;
		const s = strm.state;
		const wrap = s.wrap;
		if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) return Z_STREAM_ERROR$2;
		if (wrap === 1) strm.adler = adler32_1(strm.adler, dictionary, dictLength, 0);
		s.wrap = 0;
		if (dictLength >= s.w_size) {
			if (wrap === 0) {
				/*** CLEAR_HASH(s); ***/
				zero(s.head);
				s.strstart = 0;
				s.block_start = 0;
				s.insert = 0;
			}
			let tmpDict = new Uint8Array(s.w_size);
			tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
			dictionary = tmpDict;
			dictLength = s.w_size;
		}
		const avail = strm.avail_in;
		const next = strm.next_in;
		const input = strm.input;
		strm.avail_in = dictLength;
		strm.next_in = 0;
		strm.input = dictionary;
		fill_window(s);
		while (s.lookahead >= MIN_MATCH) {
			let str = s.strstart;
			let n = s.lookahead - 2;
			do {
				INSERT_STRING(s, str);
				str++;
			} while (--n);
			s.strstart = str;
			s.lookahead = 2;
			fill_window(s);
		}
		s.strstart += s.lookahead;
		s.block_start = s.strstart;
		s.insert = s.lookahead;
		s.lookahead = 0;
		s.match_length = s.prev_length = 2;
		s.match_available = 0;
		strm.next_in = next;
		strm.input = input;
		strm.avail_in = avail;
		s.wrap = wrap;
		return Z_OK$3;
	};
	deflate_1$2 = {
		deflateInit,
		deflateInit2,
		deflateReset,
		deflateResetKeep,
		deflateSetHeader,
		deflate: deflate$2,
		deflateEnd,
		deflateSetDictionary,
		deflateInfo: "pako deflate (from Nodeca project)"
	};
	_has = (obj, key) => {
		return Object.prototype.hasOwnProperty.call(obj, key);
	};
	assign = function(obj) {
		const sources = Array.prototype.slice.call(arguments, 1);
		while (sources.length) {
			const source = sources.shift();
			if (!source) continue;
			if (typeof source !== "object") throw new TypeError(source + "must be non-object");
			for (const p in source) if (_has(source, p)) obj[p] = source[p];
		}
		return obj;
	};
	flattenChunks = (chunks) => {
		let len = 0;
		for (let i = 0, l = chunks.length; i < l; i++) len += chunks[i].length;
		const result = new Uint8Array(len);
		for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
			let chunk = chunks[i];
			result.set(chunk, pos);
			pos += chunk.length;
		}
		return result;
	};
	common = {
		assign,
		flattenChunks
	};
	STR_APPLY_UIA_OK = true;
	try {
		String.fromCharCode.apply(null, /* @__PURE__ */ new Uint8Array(1));
	} catch (__) {
		STR_APPLY_UIA_OK = false;
	}
	_utf8len = /* @__PURE__ */ new Uint8Array(256);
	for (let q = 0; q < 256; q++) _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
	_utf8len[254] = _utf8len[255] = 1;
	string2buf = (str) => {
		if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) return new TextEncoder().encode(str);
		let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
		for (m_pos = 0; m_pos < str_len; m_pos++) {
			c = str.charCodeAt(m_pos);
			if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
				c2 = str.charCodeAt(m_pos + 1);
				if ((c2 & 64512) === 56320) {
					c = 65536 + (c - 55296 << 10) + (c2 - 56320);
					m_pos++;
				}
			}
			buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
		}
		buf = new Uint8Array(buf_len);
		for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
			c = str.charCodeAt(m_pos);
			if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
				c2 = str.charCodeAt(m_pos + 1);
				if ((c2 & 64512) === 56320) {
					c = 65536 + (c - 55296 << 10) + (c2 - 56320);
					m_pos++;
				}
			}
			if (c < 128) buf[i++] = c;
			else if (c < 2048) {
				buf[i++] = 192 | c >>> 6;
				buf[i++] = 128 | c & 63;
			} else if (c < 65536) {
				buf[i++] = 224 | c >>> 12;
				buf[i++] = 128 | c >>> 6 & 63;
				buf[i++] = 128 | c & 63;
			} else {
				buf[i++] = 240 | c >>> 18;
				buf[i++] = 128 | c >>> 12 & 63;
				buf[i++] = 128 | c >>> 6 & 63;
				buf[i++] = 128 | c & 63;
			}
		}
		return buf;
	};
	buf2binstring = (buf, len) => {
		if (len < 65534) {
			if (buf.subarray && STR_APPLY_UIA_OK) return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
		}
		let result = "";
		for (let i = 0; i < len; i++) result += String.fromCharCode(buf[i]);
		return result;
	};
	buf2string = (buf, max) => {
		const len = max || buf.length;
		if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) return new TextDecoder().decode(buf.subarray(0, max));
		let i, out;
		const utf16buf = new Array(len * 2);
		for (out = 0, i = 0; i < len;) {
			let c = buf[i++];
			if (c < 128) {
				utf16buf[out++] = c;
				continue;
			}
			let c_len = _utf8len[c];
			if (c_len > 4) {
				utf16buf[out++] = 65533;
				i += c_len - 1;
				continue;
			}
			c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
			while (c_len > 1 && i < len) {
				c = c << 6 | buf[i++] & 63;
				c_len--;
			}
			if (c_len > 1) {
				utf16buf[out++] = 65533;
				continue;
			}
			if (c < 65536) utf16buf[out++] = c;
			else {
				c -= 65536;
				utf16buf[out++] = 55296 | c >> 10 & 1023;
				utf16buf[out++] = 56320 | c & 1023;
			}
		}
		return buf2binstring(utf16buf, out);
	};
	utf8border = (buf, max) => {
		max = max || buf.length;
		if (max > buf.length) max = buf.length;
		let pos = max - 1;
		while (pos >= 0 && (buf[pos] & 192) === 128) pos--;
		if (pos < 0) return max;
		if (pos === 0) return max;
		return pos + _utf8len[buf[pos]] > max ? pos : max;
	};
	strings = {
		string2buf,
		buf2string,
		utf8border
	};
	zstream = ZStream;
	toString$1 = Object.prototype.toString;
	({Z_NO_FLUSH: Z_NO_FLUSH$1, Z_SYNC_FLUSH, Z_FULL_FLUSH, Z_FINISH: Z_FINISH$2, Z_OK: Z_OK$2, Z_STREAM_END: Z_STREAM_END$2, Z_DEFAULT_COMPRESSION, Z_DEFAULT_STRATEGY, Z_DEFLATED: Z_DEFLATED$1} = constants$2);
	defaultOptions$1 = {
		level: Z_DEFAULT_COMPRESSION,
		method: Z_DEFLATED$1,
		chunkSize: 16384,
		windowBits: 15,
		memLevel: 8,
		strategy: Z_DEFAULT_STRATEGY,
		legacyHash: true
	};
	/**
	* Deflate#push(data[, flush_mode]) -> Boolean
	* - data (Uint8Array|ArrayBuffer|String): input data. Strings will be
	*   converted to utf8 byte sequence.
	* - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
	*   See constants. Skipped or `false` means Z_NO_FLUSH, `true` means Z_FINISH.
	*
	* Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
	* new compressed chunks. Returns `true` on success. The last data block must
	* have `flush_mode` Z_FINISH (or `true`). That will flush internal pending
	* buffers and call [[Deflate#onEnd]].
	*
	* On fail call [[Deflate#onEnd]] with error code and return false.
	*
	* ##### Example
	*
	* ```javascript
	* push(chunk, false); // push one of data chunks
	* ...
	* push(chunk, true);  // push last chunk
	* ```
	**/
	Deflate$1.prototype.push = function(data, flush_mode) {
		const strm = this.strm;
		const chunkSize = this.options.chunkSize;
		let status, _flush_mode;
		if (this.ended) return false;
		if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
		else _flush_mode = flush_mode === true ? Z_FINISH$2 : Z_NO_FLUSH$1;
		if (typeof data === "string") strm.input = strings.string2buf(data);
		else if (toString$1.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
		else strm.input = data;
		strm.next_in = 0;
		strm.avail_in = strm.input.length;
		for (;;) {
			if (strm.avail_out === 0) {
				strm.output = new Uint8Array(chunkSize);
				strm.next_out = 0;
				strm.avail_out = chunkSize;
			}
			if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
				this.onData(strm.output.subarray(0, strm.next_out));
				strm.avail_out = 0;
				continue;
			}
			status = deflate_1$2.deflate(strm, _flush_mode);
			if (status === Z_STREAM_END$2) {
				if (strm.next_out > 0) this.onData(strm.output.subarray(0, strm.next_out));
				status = deflate_1$2.deflateEnd(this.strm);
				this.onEnd(status);
				this.ended = true;
				return status === Z_OK$2;
			}
			if (strm.avail_out === 0) {
				this.onData(strm.output);
				continue;
			}
			if (_flush_mode > 0 && strm.next_out > 0) {
				this.onData(strm.output.subarray(0, strm.next_out));
				strm.avail_out = 0;
				continue;
			}
			if (strm.avail_in === 0) break;
		}
		return true;
	};
	/**
	* Deflate#onData(chunk) -> Void
	* - chunk (Uint8Array): output data.
	*
	* By default, stores data blocks in `chunks[]` property and glue
	* those in `onEnd`. Override this handler, if you need another behaviour.
	**/
	Deflate$1.prototype.onData = function(chunk) {
		this.chunks.push(chunk);
	};
	/**
	* Deflate#onEnd(status) -> Void
	* - status (Number): deflate status. 0 (Z_OK) on success,
	*   other if not.
	*
	* Called once after you tell deflate that the input stream is
	* complete (Z_FINISH). By default - join collected chunks,
	* free memory and fill `results` / `err` properties.
	**/
	Deflate$1.prototype.onEnd = function(status) {
		if (status === Z_OK$2) this.result = common.flattenChunks(this.chunks);
		this.chunks = [];
		this.err = status;
		this.msg = this.strm.msg;
	};
	deflate_1$1 = {
		Deflate: Deflate$1,
		deflate: deflate$1,
		deflateRaw: deflateRaw$1,
		gzip: gzip$1,
		constants: constants$2
	};
	BAD$1 = 16209;
	TYPE$1 = 16191;
	inffast = function inflate_fast(strm, start) {
		let _in;
		let last;
		let _out;
		let beg;
		let end;
		let dmax;
		let wsize;
		let whave;
		let wnext;
		let s_window;
		let hold;
		let bits;
		let lcode;
		let dcode;
		let lmask;
		let dmask;
		let here;
		let op;
		let len;
		let dist;
		let from;
		let from_source;
		let input, output;
		const state = strm.state;
		_in = strm.next_in;
		input = strm.input;
		last = _in + (strm.avail_in - 5);
		_out = strm.next_out;
		output = strm.output;
		beg = _out - (start - strm.avail_out);
		end = _out + (strm.avail_out - 257);
		dmax = state.dmax;
		wsize = state.wsize;
		whave = state.whave;
		wnext = state.wnext;
		s_window = state.window;
		hold = state.hold;
		bits = state.bits;
		lcode = state.lencode;
		dcode = state.distcode;
		lmask = (1 << state.lenbits) - 1;
		dmask = (1 << state.distbits) - 1;
		top: do {
			if (bits < 15) {
				hold += input[_in++] << bits;
				bits += 8;
				hold += input[_in++] << bits;
				bits += 8;
			}
			here = lcode[hold & lmask];
			dolen: for (;;) {
				op = here >>> 24;
				hold >>>= op;
				bits -= op;
				op = here >>> 16 & 255;
				if (op === 0) output[_out++] = here & 65535;
				else if (op & 16) {
					len = here & 65535;
					op &= 15;
					if (op) {
						if (bits < op) {
							hold += input[_in++] << bits;
							bits += 8;
						}
						len += hold & (1 << op) - 1;
						hold >>>= op;
						bits -= op;
					}
					if (bits < 15) {
						hold += input[_in++] << bits;
						bits += 8;
						hold += input[_in++] << bits;
						bits += 8;
					}
					here = dcode[hold & dmask];
					dodist: for (;;) {
						op = here >>> 24;
						hold >>>= op;
						bits -= op;
						op = here >>> 16 & 255;
						if (op & 16) {
							dist = here & 65535;
							op &= 15;
							if (bits < op) {
								hold += input[_in++] << bits;
								bits += 8;
								if (bits < op) {
									hold += input[_in++] << bits;
									bits += 8;
								}
							}
							dist += hold & (1 << op) - 1;
							if (dist > dmax) {
								strm.msg = "invalid distance too far back";
								state.mode = BAD$1;
								break top;
							}
							hold >>>= op;
							bits -= op;
							op = _out - beg;
							if (dist > op) {
								op = dist - op;
								if (op > whave) {
									if (state.sane) {
										strm.msg = "invalid distance too far back";
										state.mode = BAD$1;
										break top;
									}
								}
								from = 0;
								from_source = s_window;
								if (wnext === 0) {
									from += wsize - op;
									if (op < len) {
										len -= op;
										do
											output[_out++] = s_window[from++];
										while (--op);
										from = _out - dist;
										from_source = output;
									}
								} else if (wnext < op) {
									from += wsize + wnext - op;
									op -= wnext;
									if (op < len) {
										len -= op;
										do
											output[_out++] = s_window[from++];
										while (--op);
										from = 0;
										if (wnext < len) {
											op = wnext;
											len -= op;
											do
												output[_out++] = s_window[from++];
											while (--op);
											from = _out - dist;
											from_source = output;
										}
									}
								} else {
									from += wnext - op;
									if (op < len) {
										len -= op;
										do
											output[_out++] = s_window[from++];
										while (--op);
										from = _out - dist;
										from_source = output;
									}
								}
								while (len > 2) {
									output[_out++] = from_source[from++];
									output[_out++] = from_source[from++];
									output[_out++] = from_source[from++];
									len -= 3;
								}
								if (len) {
									output[_out++] = from_source[from++];
									if (len > 1) output[_out++] = from_source[from++];
								}
							} else {
								from = _out - dist;
								do {
									output[_out++] = output[from++];
									output[_out++] = output[from++];
									output[_out++] = output[from++];
									len -= 3;
								} while (len > 2);
								if (len) {
									output[_out++] = output[from++];
									if (len > 1) output[_out++] = output[from++];
								}
							}
						} else if ((op & 64) === 0) {
							here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
							continue dodist;
						} else {
							strm.msg = "invalid distance code";
							state.mode = BAD$1;
							break top;
						}
						break;
					}
				} else if ((op & 64) === 0) {
					here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
					continue dolen;
				} else if (op & 32) {
					state.mode = TYPE$1;
					break top;
				} else {
					strm.msg = "invalid literal/length code";
					state.mode = BAD$1;
					break top;
				}
				break;
			}
		} while (_in < last && _out < end);
		len = bits >> 3;
		_in -= len;
		bits -= len << 3;
		hold &= (1 << bits) - 1;
		strm.next_in = _in;
		strm.next_out = _out;
		strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
		strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
		state.hold = hold;
		state.bits = bits;
	};
	MAXBITS = 15;
	ENOUGH_LENS$1 = 852;
	ENOUGH_DISTS$1 = 592;
	CODES$1 = 0;
	LENS$1 = 1;
	DISTS$1 = 2;
	lbase = new Uint16Array([
		3,
		4,
		5,
		6,
		7,
		8,
		9,
		10,
		11,
		13,
		15,
		17,
		19,
		23,
		27,
		31,
		35,
		43,
		51,
		59,
		67,
		83,
		99,
		115,
		131,
		163,
		195,
		227,
		258,
		0,
		0
	]);
	lext = new Uint8Array([
		16,
		16,
		16,
		16,
		16,
		16,
		16,
		16,
		17,
		17,
		17,
		17,
		18,
		18,
		18,
		18,
		19,
		19,
		19,
		19,
		20,
		20,
		20,
		20,
		21,
		21,
		21,
		21,
		16,
		199,
		75
	]);
	dbase = new Uint16Array([
		1,
		2,
		3,
		4,
		5,
		7,
		9,
		13,
		17,
		25,
		33,
		49,
		65,
		97,
		129,
		193,
		257,
		385,
		513,
		769,
		1025,
		1537,
		2049,
		3073,
		4097,
		6145,
		8193,
		12289,
		16385,
		24577,
		0,
		0
	]);
	dext = new Uint8Array([
		16,
		16,
		16,
		16,
		17,
		17,
		18,
		18,
		19,
		19,
		20,
		20,
		21,
		21,
		22,
		22,
		23,
		23,
		24,
		24,
		25,
		25,
		26,
		26,
		27,
		27,
		28,
		28,
		29,
		29,
		64,
		64
	]);
	inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
		const bits = opts.bits;
		let len = 0;
		let sym = 0;
		let min = 0, max = 0;
		let root = 0;
		let curr = 0;
		let drop = 0;
		let left = 0;
		let used = 0;
		let huff = 0;
		let incr;
		let fill;
		let low;
		let mask;
		let next;
		let base = null;
		let match;
		const count = /* @__PURE__ */ new Uint16Array(16);
		const offs = /* @__PURE__ */ new Uint16Array(16);
		let extra = null;
		let here_bits, here_op, here_val;
		for (len = 0; len <= MAXBITS; len++) count[len] = 0;
		for (sym = 0; sym < codes; sym++) count[lens[lens_index + sym]]++;
		root = bits;
		for (max = MAXBITS; max >= 1; max--) if (count[max] !== 0) break;
		if (root > max) root = max;
		if (max === 0) {
			table[table_index++] = 20971520;
			table[table_index++] = 20971520;
			opts.bits = 1;
			return 0;
		}
		for (min = 1; min < max; min++) if (count[min] !== 0) break;
		if (root < min) root = min;
		left = 1;
		for (len = 1; len <= MAXBITS; len++) {
			left <<= 1;
			left -= count[len];
			if (left < 0) return -1;
		}
		if (left > 0 && (type === CODES$1 || max !== 1)) return -1;
		offs[1] = 0;
		for (len = 1; len < MAXBITS; len++) offs[len + 1] = offs[len] + count[len];
		for (sym = 0; sym < codes; sym++) if (lens[lens_index + sym] !== 0) work[offs[lens[lens_index + sym]]++] = sym;
		if (type === CODES$1) {
			base = extra = work;
			match = 20;
		} else if (type === LENS$1) {
			base = lbase;
			extra = lext;
			match = 257;
		} else {
			base = dbase;
			extra = dext;
			match = 0;
		}
		huff = 0;
		sym = 0;
		len = min;
		next = table_index;
		curr = root;
		drop = 0;
		low = -1;
		used = 1 << root;
		mask = used - 1;
		if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
		for (;;) {
			here_bits = len - drop;
			if (work[sym] + 1 < match) {
				here_op = 0;
				here_val = work[sym];
			} else if (work[sym] >= match) {
				here_op = extra[work[sym] - match];
				here_val = base[work[sym] - match];
			} else {
				here_op = 96;
				here_val = 0;
			}
			incr = 1 << len - drop;
			fill = 1 << curr;
			min = fill;
			do {
				fill -= incr;
				table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
			} while (fill !== 0);
			incr = 1 << len - 1;
			while (huff & incr) incr >>= 1;
			if (incr !== 0) {
				huff &= incr - 1;
				huff += incr;
			} else huff = 0;
			sym++;
			if (--count[len] === 0) {
				if (len === max) break;
				len = lens[lens_index + work[sym]];
			}
			if (len > root && (huff & mask) !== low) {
				if (drop === 0) drop = root;
				next += min;
				curr = len - drop;
				left = 1 << curr;
				while (curr + drop < max) {
					left -= count[curr + drop];
					if (left <= 0) break;
					curr++;
					left <<= 1;
				}
				used += 1 << curr;
				if (type === LENS$1 && used > ENOUGH_LENS$1 || type === DISTS$1 && used > ENOUGH_DISTS$1) return 1;
				low = huff & mask;
				table[low] = root << 24 | curr << 16 | next - table_index | 0;
			}
		}
		if (huff !== 0) table[next + huff] = len - drop << 24 | 4194304;
		opts.bits = root;
		return 0;
	};
	inftrees = inflate_table;
	CODES = 0;
	LENS = 1;
	DISTS = 2;
	({Z_FINISH: Z_FINISH$1, Z_BLOCK, Z_TREES, Z_OK: Z_OK$1, Z_STREAM_END: Z_STREAM_END$1, Z_NEED_DICT: Z_NEED_DICT$1, Z_STREAM_ERROR: Z_STREAM_ERROR$1, Z_DATA_ERROR: Z_DATA_ERROR$1, Z_MEM_ERROR: Z_MEM_ERROR$1, Z_BUF_ERROR: Z_BUF_ERROR$1, Z_DEFLATED} = constants$2);
	HEAD = 16180;
	FLAGS = 16181;
	TIME = 16182;
	OS = 16183;
	EXLEN = 16184;
	EXTRA = 16185;
	NAME = 16186;
	COMMENT = 16187;
	HCRC = 16188;
	DICTID = 16189;
	DICT = 16190;
	TYPE = 16191;
	TYPEDO = 16192;
	STORED = 16193;
	COPY_ = 16194;
	COPY = 16195;
	TABLE = 16196;
	LENLENS = 16197;
	CODELENS = 16198;
	LEN_ = 16199;
	LEN = 16200;
	LENEXT = 16201;
	DIST = 16202;
	DISTEXT = 16203;
	MATCH = 16204;
	LIT = 16205;
	CHECK = 16206;
	LENGTH = 16207;
	DONE = 16208;
	BAD = 16209;
	MEM = 16210;
	SYNC = 16211;
	ENOUGH_LENS = 852;
	ENOUGH_DISTS = 592;
	DEF_WBITS = 15;
	zswap32 = (q) => {
		return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
	};
	inflateStateCheck = (strm) => {
		if (!strm) return 1;
		const state = strm.state;
		if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) return 1;
		return 0;
	};
	inflateResetKeep = (strm) => {
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		const state = strm.state;
		strm.total_in = strm.total_out = state.total = 0;
		strm.msg = "";
		if (state.wrap) strm.adler = state.wrap & 1;
		state.mode = HEAD;
		state.last = 0;
		state.havedict = 0;
		state.flags = -1;
		state.dmax = 32768;
		state.head = null;
		state.hold = 0;
		state.bits = 0;
		state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
		state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
		state.sane = 1;
		state.back = -1;
		return Z_OK$1;
	};
	inflateReset = (strm) => {
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		const state = strm.state;
		state.wsize = 0;
		state.whave = 0;
		state.wnext = 0;
		return inflateResetKeep(strm);
	};
	inflateReset2 = (strm, windowBits) => {
		let wrap;
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		const state = strm.state;
		if (windowBits < 0) {
			wrap = 0;
			windowBits = -windowBits;
		} else {
			wrap = (windowBits >> 4) + 5;
			if (windowBits < 48) windowBits &= 15;
		}
		if (windowBits && (windowBits < 8 || windowBits > 15)) return Z_STREAM_ERROR$1;
		if (state.window !== null && state.wbits !== windowBits) state.window = null;
		state.wrap = wrap;
		state.wbits = windowBits;
		return inflateReset(strm);
	};
	inflateInit2 = (strm, windowBits) => {
		if (!strm) return Z_STREAM_ERROR$1;
		const state = new InflateState();
		strm.state = state;
		state.strm = strm;
		state.window = null;
		state.mode = HEAD;
		const ret = inflateReset2(strm, windowBits);
		if (ret !== Z_OK$1) strm.state = null;
		return ret;
	};
	inflateInit = (strm) => {
		return inflateInit2(strm, DEF_WBITS);
	};
	virgin = true;
	fixedtables = (state) => {
		if (virgin) {
			lenfix = /* @__PURE__ */ new Int32Array(512);
			distfix = /* @__PURE__ */ new Int32Array(32);
			let sym = 0;
			while (sym < 144) state.lens[sym++] = 8;
			while (sym < 256) state.lens[sym++] = 9;
			while (sym < 280) state.lens[sym++] = 7;
			while (sym < 288) state.lens[sym++] = 8;
			inftrees(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
			sym = 0;
			while (sym < 32) state.lens[sym++] = 5;
			inftrees(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
			virgin = false;
		}
		state.lencode = lenfix;
		state.lenbits = 9;
		state.distcode = distfix;
		state.distbits = 5;
	};
	updatewindow = (strm, src, end, copy) => {
		let dist;
		const state = strm.state;
		if (state.window === null) state.window = new Uint8Array(1 << state.wbits);
		if (state.wsize === 0) {
			state.wsize = 1 << state.wbits;
			state.wnext = 0;
			state.whave = 0;
		}
		if (copy >= state.wsize) {
			state.window.set(src.subarray(end - state.wsize, end), 0);
			state.wnext = 0;
			state.whave = state.wsize;
		} else {
			dist = state.wsize - state.wnext;
			if (dist > copy) dist = copy;
			state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
			copy -= dist;
			if (copy) {
				state.window.set(src.subarray(end - copy, end), 0);
				state.wnext = copy;
				state.whave = state.wsize;
			} else {
				state.wnext += dist;
				if (state.wnext === state.wsize) state.wnext = 0;
				if (state.whave < state.wsize) state.whave += dist;
			}
		}
		return 0;
	};
	inflate$2 = (strm, flush) => {
		let state;
		let input, output;
		let next;
		let put;
		let have, left;
		let hold;
		let bits;
		let _in, _out;
		let copy;
		let from;
		let from_source;
		let here = 0;
		let here_bits, here_op, here_val;
		let last_bits, last_op, last_val;
		let len;
		let ret;
		const hbuf = /* @__PURE__ */ new Uint8Array(4);
		let opts;
		let n;
		const order = new Uint8Array([
			16,
			17,
			18,
			0,
			8,
			7,
			9,
			6,
			10,
			5,
			11,
			4,
			12,
			3,
			13,
			2,
			14,
			1,
			15
		]);
		if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) return Z_STREAM_ERROR$1;
		state = strm.state;
		if (state.mode === TYPE) state.mode = TYPEDO;
		put = strm.next_out;
		output = strm.output;
		left = strm.avail_out;
		next = strm.next_in;
		input = strm.input;
		have = strm.avail_in;
		hold = state.hold;
		bits = state.bits;
		_in = have;
		_out = left;
		ret = Z_OK$1;
		inf_leave: for (;;) switch (state.mode) {
			case HEAD:
				if (state.wrap === 0) {
					state.mode = TYPEDO;
					break;
				}
				while (bits < 16) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (state.wrap & 2 && hold === 35615) {
					if (state.wbits === 0) state.wbits = 15;
					state.check = 0;
					hbuf[0] = hold & 255;
					hbuf[1] = hold >>> 8 & 255;
					state.check = crc32_1(state.check, hbuf, 2, 0);
					hold = 0;
					bits = 0;
					state.mode = FLAGS;
					break;
				}
				if (state.head) state.head.done = false;
				if (!(state.wrap & 1) || (((hold & 255) << 8) + (hold >> 8)) % 31) {
					strm.msg = "incorrect header check";
					state.mode = BAD;
					break;
				}
				if ((hold & 15) !== Z_DEFLATED) {
					strm.msg = "unknown compression method";
					state.mode = BAD;
					break;
				}
				hold >>>= 4;
				bits -= 4;
				len = (hold & 15) + 8;
				if (state.wbits === 0) state.wbits = len;
				if (len > 15 || len > state.wbits) {
					strm.msg = "invalid window size";
					state.mode = BAD;
					break;
				}
				state.dmax = 1 << state.wbits;
				state.flags = 0;
				strm.adler = state.check = 1;
				state.mode = hold & 512 ? DICTID : TYPE;
				hold = 0;
				bits = 0;
				break;
			case FLAGS:
				while (bits < 16) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.flags = hold;
				if ((state.flags & 255) !== Z_DEFLATED) {
					strm.msg = "unknown compression method";
					state.mode = BAD;
					break;
				}
				if (state.flags & 57344) {
					strm.msg = "unknown header flags set";
					state.mode = BAD;
					break;
				}
				if (state.head) state.head.text = hold >> 8 & 1;
				if (state.flags & 512 && state.wrap & 4) {
					hbuf[0] = hold & 255;
					hbuf[1] = hold >>> 8 & 255;
					state.check = crc32_1(state.check, hbuf, 2, 0);
				}
				hold = 0;
				bits = 0;
				state.mode = TIME;
			case TIME:
				while (bits < 32) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (state.head) state.head.time = hold;
				if (state.flags & 512 && state.wrap & 4) {
					hbuf[0] = hold & 255;
					hbuf[1] = hold >>> 8 & 255;
					hbuf[2] = hold >>> 16 & 255;
					hbuf[3] = hold >>> 24 & 255;
					state.check = crc32_1(state.check, hbuf, 4, 0);
				}
				hold = 0;
				bits = 0;
				state.mode = OS;
			case OS:
				while (bits < 16) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (state.head) {
					state.head.xflags = hold & 255;
					state.head.os = hold >> 8;
				}
				if (state.flags & 512 && state.wrap & 4) {
					hbuf[0] = hold & 255;
					hbuf[1] = hold >>> 8 & 255;
					state.check = crc32_1(state.check, hbuf, 2, 0);
				}
				hold = 0;
				bits = 0;
				state.mode = EXLEN;
			case EXLEN:
				if (state.flags & 1024) {
					while (bits < 16) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					state.length = hold;
					if (state.head) state.head.extra_len = hold;
					if (state.flags & 512 && state.wrap & 4) {
						hbuf[0] = hold & 255;
						hbuf[1] = hold >>> 8 & 255;
						state.check = crc32_1(state.check, hbuf, 2, 0);
					}
					hold = 0;
					bits = 0;
				} else if (state.head) state.head.extra = null;
				state.mode = EXTRA;
			case EXTRA:
				if (state.flags & 1024) {
					copy = state.length;
					if (copy > have) copy = have;
					if (copy) {
						if (state.head) {
							len = state.head.extra_len - state.length;
							if (!state.head.extra) state.head.extra = new Uint8Array(state.head.extra_len);
							state.head.extra.set(input.subarray(next, next + copy), len);
						}
						if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
						have -= copy;
						next += copy;
						state.length -= copy;
					}
					if (state.length) break inf_leave;
				}
				state.length = 0;
				state.mode = NAME;
			case NAME:
				if (state.flags & 2048) {
					if (have === 0) break inf_leave;
					copy = 0;
					do {
						len = input[next + copy++];
						if (state.head && len && state.length < 65536) state.head.name += String.fromCharCode(len);
					} while (len && copy < have);
					if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
					have -= copy;
					next += copy;
					if (len) break inf_leave;
				} else if (state.head) state.head.name = null;
				state.length = 0;
				state.mode = COMMENT;
			case COMMENT:
				if (state.flags & 4096) {
					if (have === 0) break inf_leave;
					copy = 0;
					do {
						len = input[next + copy++];
						if (state.head && len && state.length < 65536) state.head.comment += String.fromCharCode(len);
					} while (len && copy < have);
					if (state.flags & 512 && state.wrap & 4) state.check = crc32_1(state.check, input, copy, next);
					have -= copy;
					next += copy;
					if (len) break inf_leave;
				} else if (state.head) state.head.comment = null;
				state.mode = HCRC;
			case HCRC:
				if (state.flags & 512) {
					while (bits < 16) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					if (state.wrap & 4 && hold !== (state.check & 65535)) {
						strm.msg = "header crc mismatch";
						state.mode = BAD;
						break;
					}
					hold = 0;
					bits = 0;
				}
				if (state.head) {
					state.head.hcrc = state.flags >> 9 & 1;
					state.head.done = true;
				}
				strm.adler = state.check = 0;
				state.mode = TYPE;
				break;
			case DICTID:
				while (bits < 32) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				strm.adler = state.check = zswap32(hold);
				hold = 0;
				bits = 0;
				state.mode = DICT;
			case DICT:
				if (state.havedict === 0) {
					strm.next_out = put;
					strm.avail_out = left;
					strm.next_in = next;
					strm.avail_in = have;
					state.hold = hold;
					state.bits = bits;
					return Z_NEED_DICT$1;
				}
				strm.adler = state.check = 1;
				state.mode = TYPE;
			case TYPE: if (flush === Z_BLOCK || flush === Z_TREES) break inf_leave;
			case TYPEDO:
				if (state.last) {
					hold >>>= bits & 7;
					bits -= bits & 7;
					state.mode = CHECK;
					break;
				}
				while (bits < 3) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.last = hold & 1;
				hold >>>= 1;
				bits -= 1;
				switch (hold & 3) {
					case 0:
						state.mode = STORED;
						break;
					case 1:
						fixedtables(state);
						state.mode = LEN_;
						if (flush === Z_TREES) {
							hold >>>= 2;
							bits -= 2;
							break inf_leave;
						}
						break;
					case 2:
						state.mode = TABLE;
						break;
					case 3:
						strm.msg = "invalid block type";
						state.mode = BAD;
				}
				hold >>>= 2;
				bits -= 2;
				break;
			case STORED:
				hold >>>= bits & 7;
				bits -= bits & 7;
				while (bits < 32) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
					strm.msg = "invalid stored block lengths";
					state.mode = BAD;
					break;
				}
				state.length = hold & 65535;
				hold = 0;
				bits = 0;
				state.mode = COPY_;
				if (flush === Z_TREES) break inf_leave;
			case COPY_: state.mode = COPY;
			case COPY:
				copy = state.length;
				if (copy) {
					if (copy > have) copy = have;
					if (copy > left) copy = left;
					if (copy === 0) break inf_leave;
					output.set(input.subarray(next, next + copy), put);
					have -= copy;
					next += copy;
					left -= copy;
					put += copy;
					state.length -= copy;
					break;
				}
				state.mode = TYPE;
				break;
			case TABLE:
				while (bits < 14) {
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				state.nlen = (hold & 31) + 257;
				hold >>>= 5;
				bits -= 5;
				state.ndist = (hold & 31) + 1;
				hold >>>= 5;
				bits -= 5;
				state.ncode = (hold & 15) + 4;
				hold >>>= 4;
				bits -= 4;
				if (state.nlen > 286 || state.ndist > 30) {
					strm.msg = "too many length or distance symbols";
					state.mode = BAD;
					break;
				}
				state.have = 0;
				state.mode = LENLENS;
			case LENLENS:
				while (state.have < state.ncode) {
					while (bits < 3) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					state.lens[order[state.have++]] = hold & 7;
					hold >>>= 3;
					bits -= 3;
				}
				while (state.have < 19) state.lens[order[state.have++]] = 0;
				state.lencode = state.lendyn;
				state.lenbits = 7;
				opts = { bits: state.lenbits };
				ret = inftrees(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
				state.lenbits = opts.bits;
				if (ret) {
					strm.msg = "invalid code lengths set";
					state.mode = BAD;
					break;
				}
				state.have = 0;
				state.mode = CODELENS;
			case CODELENS:
				while (state.have < state.nlen + state.ndist) {
					for (;;) {
						here = state.lencode[hold & (1 << state.lenbits) - 1];
						here_bits = here >>> 24;
						here_op = here >>> 16 & 255;
						here_val = here & 65535;
						if (here_bits <= bits) break;
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					if (here_val < 16) {
						hold >>>= here_bits;
						bits -= here_bits;
						state.lens[state.have++] = here_val;
					} else {
						if (here_val === 16) {
							n = here_bits + 2;
							while (bits < n) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							hold >>>= here_bits;
							bits -= here_bits;
							if (state.have === 0) {
								strm.msg = "invalid bit length repeat";
								state.mode = BAD;
								break;
							}
							len = state.lens[state.have - 1];
							copy = 3 + (hold & 3);
							hold >>>= 2;
							bits -= 2;
						} else if (here_val === 17) {
							n = here_bits + 3;
							while (bits < n) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							hold >>>= here_bits;
							bits -= here_bits;
							len = 0;
							copy = 3 + (hold & 7);
							hold >>>= 3;
							bits -= 3;
						} else {
							n = here_bits + 7;
							while (bits < n) {
								if (have === 0) break inf_leave;
								have--;
								hold += input[next++] << bits;
								bits += 8;
							}
							hold >>>= here_bits;
							bits -= here_bits;
							len = 0;
							copy = 11 + (hold & 127);
							hold >>>= 7;
							bits -= 7;
						}
						if (state.have + copy > state.nlen + state.ndist) {
							strm.msg = "invalid bit length repeat";
							state.mode = BAD;
							break;
						}
						while (copy--) state.lens[state.have++] = len;
					}
				}
				if (state.mode === BAD) break;
				if (state.lens[256] === 0) {
					strm.msg = "invalid code -- missing end-of-block";
					state.mode = BAD;
					break;
				}
				state.lenbits = 9;
				opts = { bits: state.lenbits };
				ret = inftrees(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
				state.lenbits = opts.bits;
				if (ret) {
					strm.msg = "invalid literal/lengths set";
					state.mode = BAD;
					break;
				}
				state.distbits = 6;
				state.distcode = state.distdyn;
				opts = { bits: state.distbits };
				ret = inftrees(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
				state.distbits = opts.bits;
				if (ret) {
					strm.msg = "invalid distances set";
					state.mode = BAD;
					break;
				}
				state.mode = LEN_;
				if (flush === Z_TREES) break inf_leave;
			case LEN_: state.mode = LEN;
			case LEN:
				if (have >= 6 && left >= 258) {
					strm.next_out = put;
					strm.avail_out = left;
					strm.next_in = next;
					strm.avail_in = have;
					state.hold = hold;
					state.bits = bits;
					inffast(strm, _out);
					put = strm.next_out;
					output = strm.output;
					left = strm.avail_out;
					next = strm.next_in;
					input = strm.input;
					have = strm.avail_in;
					hold = state.hold;
					bits = state.bits;
					if (state.mode === TYPE) state.back = -1;
					break;
				}
				state.back = 0;
				for (;;) {
					here = state.lencode[hold & (1 << state.lenbits) - 1];
					here_bits = here >>> 24;
					here_op = here >>> 16 & 255;
					here_val = here & 65535;
					if (here_bits <= bits) break;
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if (here_op && (here_op & 240) === 0) {
					last_bits = here_bits;
					last_op = here_op;
					last_val = here_val;
					for (;;) {
						here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
						here_bits = here >>> 24;
						here_op = here >>> 16 & 255;
						here_val = here & 65535;
						if (last_bits + here_bits <= bits) break;
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					hold >>>= last_bits;
					bits -= last_bits;
					state.back += last_bits;
				}
				hold >>>= here_bits;
				bits -= here_bits;
				state.back += here_bits;
				state.length = here_val;
				if (here_op === 0) {
					state.mode = LIT;
					break;
				}
				if (here_op & 32) {
					state.back = -1;
					state.mode = TYPE;
					break;
				}
				if (here_op & 64) {
					strm.msg = "invalid literal/length code";
					state.mode = BAD;
					break;
				}
				state.extra = here_op & 15;
				state.mode = LENEXT;
			case LENEXT:
				if (state.extra) {
					n = state.extra;
					while (bits < n) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					state.length += hold & (1 << state.extra) - 1;
					hold >>>= state.extra;
					bits -= state.extra;
					state.back += state.extra;
				}
				state.was = state.length;
				state.mode = DIST;
			case DIST:
				for (;;) {
					here = state.distcode[hold & (1 << state.distbits) - 1];
					here_bits = here >>> 24;
					here_op = here >>> 16 & 255;
					here_val = here & 65535;
					if (here_bits <= bits) break;
					if (have === 0) break inf_leave;
					have--;
					hold += input[next++] << bits;
					bits += 8;
				}
				if ((here_op & 240) === 0) {
					last_bits = here_bits;
					last_op = here_op;
					last_val = here_val;
					for (;;) {
						here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
						here_bits = here >>> 24;
						here_op = here >>> 16 & 255;
						here_val = here & 65535;
						if (last_bits + here_bits <= bits) break;
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					hold >>>= last_bits;
					bits -= last_bits;
					state.back += last_bits;
				}
				hold >>>= here_bits;
				bits -= here_bits;
				state.back += here_bits;
				if (here_op & 64) {
					strm.msg = "invalid distance code";
					state.mode = BAD;
					break;
				}
				state.offset = here_val;
				state.extra = here_op & 15;
				state.mode = DISTEXT;
			case DISTEXT:
				if (state.extra) {
					n = state.extra;
					while (bits < n) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					state.offset += hold & (1 << state.extra) - 1;
					hold >>>= state.extra;
					bits -= state.extra;
					state.back += state.extra;
				}
				if (state.offset > state.dmax) {
					strm.msg = "invalid distance too far back";
					state.mode = BAD;
					break;
				}
				state.mode = MATCH;
			case MATCH:
				if (left === 0) break inf_leave;
				copy = _out - left;
				if (state.offset > copy) {
					copy = state.offset - copy;
					if (copy > state.whave) {
						if (state.sane) {
							strm.msg = "invalid distance too far back";
							state.mode = BAD;
							break;
						}
					}
					if (copy > state.wnext) {
						copy -= state.wnext;
						from = state.wsize - copy;
					} else from = state.wnext - copy;
					if (copy > state.length) copy = state.length;
					from_source = state.window;
				} else {
					from_source = output;
					from = put - state.offset;
					copy = state.length;
				}
				if (copy > left) copy = left;
				left -= copy;
				state.length -= copy;
				do
					output[put++] = from_source[from++];
				while (--copy);
				if (state.length === 0) state.mode = LEN;
				break;
			case LIT:
				if (left === 0) break inf_leave;
				output[put++] = state.length;
				left--;
				state.mode = LEN;
				break;
			case CHECK:
				if (state.wrap) {
					while (bits < 32) {
						if (have === 0) break inf_leave;
						have--;
						hold |= input[next++] << bits;
						bits += 8;
					}
					_out -= left;
					strm.total_out += _out;
					state.total += _out;
					if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, put - _out) : adler32_1(state.check, output, _out, put - _out);
					_out = left;
					if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
						strm.msg = "incorrect data check";
						state.mode = BAD;
						break;
					}
					hold = 0;
					bits = 0;
				}
				state.mode = LENGTH;
			case LENGTH:
				if (state.wrap && state.flags) {
					while (bits < 32) {
						if (have === 0) break inf_leave;
						have--;
						hold += input[next++] << bits;
						bits += 8;
					}
					if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
						strm.msg = "incorrect length check";
						state.mode = BAD;
						break;
					}
					hold = 0;
					bits = 0;
				}
				state.mode = DONE;
			case DONE:
				ret = Z_STREAM_END$1;
				break inf_leave;
			case BAD:
				ret = Z_DATA_ERROR$1;
				break inf_leave;
			case MEM: return Z_MEM_ERROR$1;
			case SYNC:
			default: return Z_STREAM_ERROR$1;
		}
		strm.next_out = put;
		strm.avail_out = left;
		strm.next_in = next;
		strm.avail_in = have;
		state.hold = hold;
		state.bits = bits;
		if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH$1)) {
			if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out));
		}
		_in -= strm.avail_in;
		_out -= strm.avail_out;
		strm.total_in += _in;
		strm.total_out += _out;
		state.total += _out;
		if (state.wrap & 4 && _out) strm.adler = state.check = state.flags ? crc32_1(state.check, output, _out, strm.next_out - _out) : adler32_1(state.check, output, _out, strm.next_out - _out);
		strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
		if ((_in === 0 && _out === 0 || flush === Z_FINISH$1) && ret === Z_OK$1) ret = Z_BUF_ERROR$1;
		return ret;
	};
	inflateEnd = (strm) => {
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		let state = strm.state;
		if (state.window) state.window = null;
		strm.state = null;
		return Z_OK$1;
	};
	inflateGetHeader = (strm, head) => {
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		const state = strm.state;
		if ((state.wrap & 2) === 0) return Z_STREAM_ERROR$1;
		state.head = head;
		head.done = false;
		return Z_OK$1;
	};
	inflateSetDictionary = (strm, dictionary) => {
		const dictLength = dictionary.length;
		let state;
		let dictid;
		let ret;
		if (inflateStateCheck(strm)) return Z_STREAM_ERROR$1;
		state = strm.state;
		if (state.wrap !== 0 && state.mode !== DICT) return Z_STREAM_ERROR$1;
		if (state.mode === DICT) {
			dictid = 1;
			dictid = adler32_1(dictid, dictionary, dictLength, 0);
			if (dictid !== state.check) return Z_DATA_ERROR$1;
		}
		ret = updatewindow(strm, dictionary, dictLength, dictLength);
		if (ret) {
			state.mode = MEM;
			return Z_MEM_ERROR$1;
		}
		state.havedict = 1;
		return Z_OK$1;
	};
	inflate_1$2 = {
		inflateReset,
		inflateReset2,
		inflateResetKeep,
		inflateInit,
		inflateInit2,
		inflate: inflate$2,
		inflateEnd,
		inflateGetHeader,
		inflateSetDictionary,
		inflateInfo: "pako inflate (from Nodeca project)"
	};
	gzheader = GZheader;
	toString = Object.prototype.toString;
	({Z_NO_FLUSH, Z_FINISH, Z_OK, Z_STREAM_END, Z_NEED_DICT, Z_STREAM_ERROR, Z_DATA_ERROR, Z_MEM_ERROR, Z_BUF_ERROR} = constants$2);
	defaultOptions = {
		chunkSize: 65536,
		windowBits: 15,
		to: ""
	};
	/**
	* Inflate#push(data[, flush_mode]) -> Boolean
	* - data (Uint8Array|ArrayBuffer): input data
	* - flush_mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE
	*   flush modes. See constants. Skipped or `false` means Z_NO_FLUSH,
	*   `true` means Z_FINISH.
	*
	* Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
	* new output chunks. Returns `true` on success. If end of stream detected,
	* [[Inflate#onEnd]] will be called.
	*
	* `flush_mode` is not needed for normal operation, because end of stream
	* detected automatically. You may try to use it for advanced things, but
	* this functionality was not tested.
	*
	* On fail call [[Inflate#onEnd]] with error code and return false.
	*
	* ##### Example
	*
	* ```javascript
	* push(chunk, false); // push one of data chunks
	* ...
	* push(chunk, true);  // push last chunk
	* ```
	**/
	Inflate$1.prototype.push = function(data, flush_mode) {
		const strm = this.strm;
		const chunkSize = this.options.chunkSize;
		const dictionary = this.options.dictionary;
		let status, _flush_mode, last_avail_out;
		if (this.ended) return false;
		if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
		else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
		if (toString.call(data) === "[object ArrayBuffer]") strm.input = new Uint8Array(data);
		else strm.input = data;
		strm.next_in = 0;
		strm.avail_in = strm.input.length;
		for (;;) {
			if (strm.avail_out === 0) {
				strm.output = new Uint8Array(chunkSize);
				strm.next_out = 0;
				strm.avail_out = chunkSize;
			}
			status = inflate_1$2.inflate(strm, _flush_mode);
			if (status === Z_NEED_DICT && dictionary) {
				status = inflate_1$2.inflateSetDictionary(strm, dictionary);
				if (status === Z_OK) status = inflate_1$2.inflate(strm, _flush_mode);
				else if (status === Z_DATA_ERROR) status = Z_NEED_DICT;
			}
			while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap & 2 && strm.state.flags !== 0 && strm.input[strm.next_in] !== 0) {
				inflate_1$2.inflateReset(strm);
				status = inflate_1$2.inflate(strm, _flush_mode);
			}
			switch (status) {
				case Z_STREAM_ERROR:
				case Z_DATA_ERROR:
				case Z_NEED_DICT:
				case Z_MEM_ERROR:
					this.onEnd(status);
					this.ended = true;
					return false;
			}
			last_avail_out = strm.avail_out;
			if (strm.next_out) {
				if (strm.avail_out === 0 || status === Z_STREAM_END || _flush_mode > 0) {
					if (this.options.to === "string") {
						let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
						let tail = strm.next_out - next_out_utf8;
						let utf8str = strings.buf2string(strm.output, next_out_utf8);
						strm.next_out = tail;
						strm.avail_out = chunkSize - tail;
						if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
						this.onData(utf8str);
					} else {
						this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
						strm.avail_out = 0;
						strm.next_out = 0;
					}
				}
			}
			if ((status === Z_OK || status === Z_BUF_ERROR) && last_avail_out === 0) continue;
			if (status === Z_STREAM_END) {
				status = inflate_1$2.inflateEnd(this.strm);
				this.onEnd(status);
				this.ended = true;
				return true;
			}
			if (strm.avail_in === 0) {
				if (_flush_mode === Z_FINISH) {
					status = inflate_1$2.inflateEnd(this.strm);
					this.onEnd(status === Z_OK ? Z_BUF_ERROR : status);
					this.ended = true;
					return false;
				}
				break;
			}
		}
		return true;
	};
	/**
	* Inflate#onData(chunk) -> Void
	* - chunk (Uint8Array|String): output data. When string output requested,
	*   each chunk will be string.
	*
	* By default, stores data blocks in `chunks[]` property and glue
	* those in `onEnd`. Override this handler, if you need another behaviour.
	**/
	Inflate$1.prototype.onData = function(chunk) {
		this.chunks.push(chunk);
	};
	/**
	* Inflate#onEnd(status) -> Void
	* - status (Number): inflate status. 0 (Z_OK) on success,
	*   other if not.
	*
	* Called either after you tell inflate that the input stream is
	* complete (Z_FINISH). By default - join collected chunks,
	* free memory and fill `results` / `err` properties.
	**/
	Inflate$1.prototype.onEnd = function(status) {
		if (status === Z_OK) {
			if (this.options.to === "string") this.result = this.chunks.join("");
			else this.result = common.flattenChunks(this.chunks);
		}
		this.chunks = [];
		this.err = status;
		this.msg = this.strm.msg;
	};
	inflate_1$1 = {
		Inflate: Inflate$1,
		inflate: inflate$1,
		inflateRaw: inflateRaw$1,
		ungzip: inflate$1,
		constants: constants$2
	};
	({Deflate, deflate, deflateRaw, gzip} = deflate_1$1);
	({Inflate, inflate, inflateRaw, ungzip} = inflate_1$1);
	deflate_1 = deflate;
	Inflate_1 = Inflate;
	inflate_1 = inflate;
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/crc.js
function updateCrc(currentCrc, data, length) {
	let c = currentCrc;
	for (let n = 0; n < length; n++) c = crcTable[(c ^ data[n]) & 255] ^ c >>> 8;
	return c;
}
function crc(data, length) {
	return (updateCrc(initialCrc, data, length) ^ initialCrc) >>> 0;
}
function checkCrc(buffer, crcLength, chunkName) {
	const expectedCrc = buffer.readUint32();
	const actualCrc = crc(new Uint8Array(buffer.buffer, buffer.byteOffset + buffer.offset - crcLength - 4, crcLength), crcLength);
	if (actualCrc !== expectedCrc) throw new Error(`CRC mismatch for chunk ${chunkName}. Expected ${expectedCrc}, found ${actualCrc}`);
}
function writeCrc(buffer, length) {
	buffer.writeUint32(crc(new Uint8Array(buffer.buffer, buffer.byteOffset + buffer.offset - length, length), length));
}
var crcTable, initialCrc;
var init_crc = __esmMin((() => {
	crcTable = [];
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) if (c & 1) c = 3988292384 ^ c >>> 1;
		else c = c >>> 1;
		crcTable[n] = c;
	}
	initialCrc = 4294967295;
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/unfilter.js
function unfilterNone(currentLine, newLine, bytesPerLine) {
	for (let i = 0; i < bytesPerLine; i++) newLine[i] = currentLine[i];
}
function unfilterSub(currentLine, newLine, bytesPerLine, bytesPerPixel) {
	let i = 0;
	for (; i < bytesPerPixel; i++) newLine[i] = currentLine[i];
	for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + newLine[i - bytesPerPixel] & 255;
}
function unfilterUp(currentLine, newLine, prevLine, bytesPerLine) {
	let i = 0;
	if (prevLine.length === 0) for (; i < bytesPerLine; i++) newLine[i] = currentLine[i];
	else for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + prevLine[i] & 255;
}
function unfilterAverage(currentLine, newLine, prevLine, bytesPerLine, bytesPerPixel) {
	let i = 0;
	if (prevLine.length === 0) {
		for (; i < bytesPerPixel; i++) newLine[i] = currentLine[i];
		for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + (newLine[i - bytesPerPixel] >> 1) & 255;
	} else {
		for (; i < bytesPerPixel; i++) newLine[i] = currentLine[i] + (prevLine[i] >> 1) & 255;
		for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + (newLine[i - bytesPerPixel] + prevLine[i] >> 1) & 255;
	}
}
function unfilterPaeth(currentLine, newLine, prevLine, bytesPerLine, bytesPerPixel) {
	let i = 0;
	if (prevLine.length === 0) {
		for (; i < bytesPerPixel; i++) newLine[i] = currentLine[i];
		for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + newLine[i - bytesPerPixel] & 255;
	} else {
		for (; i < bytesPerPixel; i++) newLine[i] = currentLine[i] + prevLine[i] & 255;
		for (; i < bytesPerLine; i++) newLine[i] = currentLine[i] + paethPredictor(newLine[i - bytesPerPixel], prevLine[i], prevLine[i - bytesPerPixel]) & 255;
	}
}
function paethPredictor(a, b, c) {
	const p = a + b - c;
	const pa = Math.abs(p - a);
	const pb = Math.abs(p - b);
	const pc = Math.abs(p - c);
	if (pa <= pb && pa <= pc) return a;
	else if (pb <= pc) return b;
	else return c;
}
var init_unfilter = __esmMin((() => {}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/applyUnfilter.js
/**
* Apllies filter on scanline based on the filter type.
* @param filterType - The filter type to apply.
* @param currentLine - The current line of pixel data.
* @param newLine - The new line of pixel data.
* @param prevLine - The previous line of pixel data.
* @param passLineBytes - The number of bytes in the pass line.
* @param bytesPerPixel - The number of bytes per pixel.
*/
function applyUnfilter(filterType, currentLine, newLine, prevLine, passLineBytes, bytesPerPixel) {
	switch (filterType) {
		case 0:
			unfilterNone(currentLine, newLine, passLineBytes);
			break;
		case 1:
			unfilterSub(currentLine, newLine, passLineBytes, bytesPerPixel);
			break;
		case 2:
			unfilterUp(currentLine, newLine, prevLine, passLineBytes);
			break;
		case 3:
			unfilterAverage(currentLine, newLine, prevLine, passLineBytes, bytesPerPixel);
			break;
		case 4:
			unfilterPaeth(currentLine, newLine, prevLine, passLineBytes, bytesPerPixel);
			break;
		default: throw new Error(`Unsupported filter: ${filterType}`);
	}
}
var init_applyUnfilter = __esmMin((() => {
	init_unfilter();
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/decodeInterlaceAdam7.js
/**
* Decodes the Adam7 interlaced PNG data.
*
* @param params - DecodeInterlaceNullParams
* @returns - array of pixel data.
*/
function decodeInterlaceAdam7(params) {
	const { data, width, height, channels, depth } = params;
	const passes = [
		{
			x: 0,
			y: 0,
			xStep: 8,
			yStep: 8
		},
		{
			x: 4,
			y: 0,
			xStep: 8,
			yStep: 8
		},
		{
			x: 0,
			y: 4,
			xStep: 4,
			yStep: 8
		},
		{
			x: 2,
			y: 0,
			xStep: 4,
			yStep: 4
		},
		{
			x: 0,
			y: 2,
			xStep: 2,
			yStep: 4
		},
		{
			x: 1,
			y: 0,
			xStep: 2,
			yStep: 2
		},
		{
			x: 0,
			y: 1,
			xStep: 1,
			yStep: 2
		}
	];
	const bytesPerPixel = Math.ceil(depth / 8) * channels;
	const resultData = new Uint8Array(height * width * bytesPerPixel);
	let offset = 0;
	for (let passIndex = 0; passIndex < 7; passIndex++) {
		const pass = passes[passIndex];
		const passWidth = Math.ceil((width - pass.x) / pass.xStep);
		const passHeight = Math.ceil((height - pass.y) / pass.yStep);
		if (passWidth <= 0 || passHeight <= 0) continue;
		const passLineBytes = passWidth * bytesPerPixel;
		const prevLine = new Uint8Array(passLineBytes);
		for (let y = 0; y < passHeight; y++) {
			const filterType = data[offset++];
			const currentLine = data.subarray(offset, offset + passLineBytes);
			offset += passLineBytes;
			const newLine = new Uint8Array(passLineBytes);
			applyUnfilter(filterType, currentLine, newLine, prevLine, passLineBytes, bytesPerPixel);
			prevLine.set(newLine);
			for (let x = 0; x < passWidth; x++) {
				const outputX = pass.x + x * pass.xStep;
				const outputY = pass.y + y * pass.yStep;
				if (outputX >= width || outputY >= height) continue;
				for (let i = 0; i < bytesPerPixel; i++) resultData[(outputY * width + outputX) * bytesPerPixel + i] = newLine[x * bytesPerPixel + i];
			}
		}
	}
	if (depth === 16) {
		const uint16Data = new Uint16Array(resultData.buffer);
		if (osIsLittleEndian$1) for (let k = 0; k < uint16Data.length; k++) uint16Data[k] = swap16$1(uint16Data[k]);
		return uint16Data;
	} else return resultData;
}
function swap16$1(val) {
	return (val & 255) << 8 | val >> 8 & 255;
}
var uint16$1, osIsLittleEndian$1;
var init_decodeInterlaceAdam7 = __esmMin((() => {
	init_applyUnfilter();
	uint16$1 = new Uint16Array([255]);
	osIsLittleEndian$1 = new Uint8Array(uint16$1.buffer)[0] === 255;
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/decodeInterlaceNull.js
function decodeInterlaceNull(params) {
	const { data, width, height, channels, depth } = params;
	const bytesPerPixel = Math.ceil(depth / 8) * channels;
	const bytesPerLine = Math.ceil(depth / 8 * channels * width);
	const newData = new Uint8Array(height * bytesPerLine);
	let prevLine = empty;
	let offset = 0;
	let currentLine;
	let newLine;
	for (let i = 0; i < height; i++) {
		currentLine = data.subarray(offset + 1, offset + 1 + bytesPerLine);
		newLine = newData.subarray(i * bytesPerLine, (i + 1) * bytesPerLine);
		switch (data[offset]) {
			case 0:
				unfilterNone(currentLine, newLine, bytesPerLine);
				break;
			case 1:
				unfilterSub(currentLine, newLine, bytesPerLine, bytesPerPixel);
				break;
			case 2:
				unfilterUp(currentLine, newLine, prevLine, bytesPerLine);
				break;
			case 3:
				unfilterAverage(currentLine, newLine, prevLine, bytesPerLine, bytesPerPixel);
				break;
			case 4:
				unfilterPaeth(currentLine, newLine, prevLine, bytesPerLine, bytesPerPixel);
				break;
			default: throw new Error(`Unsupported filter: ${data[offset]}`);
		}
		prevLine = newLine;
		offset += bytesPerLine + 1;
	}
	if (depth === 16) {
		const uint16Data = new Uint16Array(newData.buffer);
		if (osIsLittleEndian) for (let k = 0; k < uint16Data.length; k++) uint16Data[k] = swap16(uint16Data[k]);
		return uint16Data;
	} else return newData;
}
function swap16(val) {
	return (val & 255) << 8 | val >> 8 & 255;
}
var uint16, osIsLittleEndian, empty;
var init_decodeInterlaceNull = __esmMin((() => {
	init_unfilter();
	uint16 = new Uint16Array([255]);
	osIsLittleEndian = new Uint8Array(uint16.buffer)[0] === 255;
	empty = /* @__PURE__ */ new Uint8Array(0);
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/signature.js
function writeSignature(buffer) {
	buffer.writeBytes(pngSignature);
}
function checkSignature(buffer) {
	if (!hasPngSignature(buffer.readBytes(pngSignature.length))) throw new Error("wrong PNG signature");
}
function hasPngSignature(array) {
	if (array.length < pngSignature.length) return false;
	for (let i = 0; i < pngSignature.length; i++) if (array[i] !== pngSignature[i]) return false;
	return true;
}
var pngSignature;
var init_signature = __esmMin((() => {
	pngSignature = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
}));
//#endregion
//#region node_modules/fast-png/lib-esm/helpers/text.js
function validateKeyword(keyword) {
	validateLatin1(keyword);
	if (keyword.length === 0 || keyword.length > 79) throw new Error("keyword length must be between 1 and 79");
}
function validateLatin1(text) {
	if (!latin1Regex.test(text)) throw new Error("invalid latin1 text");
}
function decodetEXt(text, buffer, length) {
	const keyword = readKeyword(buffer);
	text[keyword] = readLatin1(buffer, length - keyword.length - 1);
}
function encodetEXt(buffer, keyword, text) {
	validateKeyword(keyword);
	validateLatin1(text);
	const length = keyword.length + 1 + text.length;
	buffer.writeUint32(length);
	buffer.writeChars(textChunkName);
	buffer.writeChars(keyword);
	buffer.writeByte(NULL);
	buffer.writeChars(text);
	writeCrc(buffer, length + 4);
}
function readKeyword(buffer) {
	buffer.mark();
	while (buffer.readByte() !== NULL);
	const end = buffer.offset;
	buffer.reset();
	const keyword = latin1Decoder.decode(buffer.readBytes(end - buffer.offset - 1));
	buffer.skip(1);
	validateKeyword(keyword);
	return keyword;
}
function readLatin1(buffer, length) {
	return latin1Decoder.decode(buffer.readBytes(length));
}
var textChunkName, NULL, latin1Decoder, latin1Regex;
var init_text = __esmMin((() => {
	init_crc();
	textChunkName = "tEXt";
	NULL = 0;
	latin1Decoder = new TextDecoder("latin1");
	latin1Regex = /^[\u0000-\u00FF]*$/;
}));
//#endregion
//#region node_modules/fast-png/lib-esm/internalTypes.js
var ColorType, CompressionMethod, FilterMethod, InterlaceMethod, DisposeOpType, BlendOpType;
var init_internalTypes = __esmMin((() => {
	ColorType = {
		UNKNOWN: -1,
		GREYSCALE: 0,
		TRUECOLOUR: 2,
		INDEXED_COLOUR: 3,
		GREYSCALE_ALPHA: 4,
		TRUECOLOUR_ALPHA: 6
	};
	CompressionMethod = {
		UNKNOWN: -1,
		DEFLATE: 0
	};
	FilterMethod = {
		UNKNOWN: -1,
		ADAPTIVE: 0
	};
	InterlaceMethod = {
		UNKNOWN: -1,
		NO_INTERLACE: 0,
		ADAM7: 1
	};
	DisposeOpType = {
		NONE: 0,
		BACKGROUND: 1,
		PREVIOUS: 2
	};
	BlendOpType = {
		SOURCE: 0,
		OVER: 1
	};
}));
//#endregion
//#region node_modules/fast-png/lib-esm/PngDecoder.js
function checkBitDepth(value) {
	if (value !== 1 && value !== 2 && value !== 4 && value !== 8 && value !== 16) throw new Error(`invalid bit depth: ${value}`);
	return value;
}
var PngDecoder;
var init_PngDecoder = __esmMin((() => {
	init_IOBuffer();
	init_pako_esm();
	init_crc();
	init_decodeInterlaceAdam7();
	init_decodeInterlaceNull();
	init_signature();
	init_text();
	init_internalTypes();
	PngDecoder = class extends IOBuffer {
		_checkCrc;
		_inflator;
		_png;
		_apng;
		_end;
		_hasPalette;
		_palette;
		_hasTransparency;
		_transparency;
		_compressionMethod;
		_filterMethod;
		_interlaceMethod;
		_colorType;
		_isAnimated;
		_numberOfFrames;
		_numberOfPlays;
		_frames;
		_writingDataChunks;
		constructor(data, options = {}) {
			super(data);
			const { checkCrc = false } = options;
			this._checkCrc = checkCrc;
			this._inflator = new Inflate_1();
			this._png = {
				width: -1,
				height: -1,
				channels: -1,
				data: /* @__PURE__ */ new Uint8Array(0),
				depth: 1,
				text: {}
			};
			this._apng = {
				width: -1,
				height: -1,
				channels: -1,
				depth: 1,
				numberOfFrames: 1,
				numberOfPlays: 0,
				text: {},
				frames: []
			};
			this._end = false;
			this._hasPalette = false;
			this._palette = [];
			this._hasTransparency = false;
			this._transparency = /* @__PURE__ */ new Uint16Array(0);
			this._compressionMethod = CompressionMethod.UNKNOWN;
			this._filterMethod = FilterMethod.UNKNOWN;
			this._interlaceMethod = InterlaceMethod.UNKNOWN;
			this._colorType = ColorType.UNKNOWN;
			this._isAnimated = false;
			this._numberOfFrames = 1;
			this._numberOfPlays = 0;
			this._frames = [];
			this._writingDataChunks = false;
			this.setBigEndian();
		}
		decode() {
			checkSignature(this);
			while (!this._end) {
				const length = this.readUint32();
				const type = this.readChars(4);
				this.decodeChunk(length, type);
			}
			this.decodeImage();
			return this._png;
		}
		decodeApng() {
			checkSignature(this);
			while (!this._end) {
				const length = this.readUint32();
				const type = this.readChars(4);
				this.decodeApngChunk(length, type);
			}
			this.decodeApngImage();
			return this._apng;
		}
		decodeChunk(length, type) {
			const offset = this.offset;
			switch (type) {
				case "IHDR":
					this.decodeIHDR();
					break;
				case "PLTE":
					this.decodePLTE(length);
					break;
				case "IDAT":
					this.decodeIDAT(length);
					break;
				case "IEND":
					this._end = true;
					break;
				case "tRNS":
					this.decodetRNS(length);
					break;
				case "iCCP":
					this.decodeiCCP(length);
					break;
				case textChunkName:
					decodetEXt(this._png.text, this, length);
					break;
				case "pHYs":
					this.decodepHYs();
					break;
				default: this.skip(length);
			}
			if (this.offset - offset !== length) throw new Error(`Length mismatch while decoding chunk ${type}`);
			if (this._checkCrc) checkCrc(this, length + 4, type);
			else this.skip(4);
		}
		decodeApngChunk(length, type) {
			const offset = this.offset;
			if (type !== "fdAT" && type !== "IDAT" && this._writingDataChunks) this.pushDataToFrame();
			switch (type) {
				case "acTL":
					this.decodeACTL();
					break;
				case "fcTL":
					this.decodeFCTL();
					break;
				case "fdAT":
					this.decodeFDAT(length);
					break;
				default:
					this.decodeChunk(length, type);
					this.offset = offset + length;
			}
			if (this.offset - offset !== length) throw new Error(`Length mismatch while decoding chunk ${type}`);
			if (this._checkCrc) checkCrc(this, length + 4, type);
			else this.skip(4);
		}
		decodeIHDR() {
			const image = this._png;
			image.width = this.readUint32();
			image.height = this.readUint32();
			image.depth = checkBitDepth(this.readUint8());
			const colorType = this.readUint8();
			this._colorType = colorType;
			let channels;
			switch (colorType) {
				case ColorType.GREYSCALE:
					channels = 1;
					break;
				case ColorType.TRUECOLOUR:
					channels = 3;
					break;
				case ColorType.INDEXED_COLOUR:
					channels = 1;
					break;
				case ColorType.GREYSCALE_ALPHA:
					channels = 2;
					break;
				case ColorType.TRUECOLOUR_ALPHA:
					channels = 4;
					break;
				case ColorType.UNKNOWN:
				default: throw new Error(`Unknown color type: ${colorType}`);
			}
			this._png.channels = channels;
			this._compressionMethod = this.readUint8();
			if (this._compressionMethod !== CompressionMethod.DEFLATE) throw new Error(`Unsupported compression method: ${this._compressionMethod}`);
			this._filterMethod = this.readUint8();
			this._interlaceMethod = this.readUint8();
		}
		decodeACTL() {
			this._numberOfFrames = this.readUint32();
			this._numberOfPlays = this.readUint32();
			this._isAnimated = true;
		}
		decodeFCTL() {
			const image = {
				sequenceNumber: this.readUint32(),
				width: this.readUint32(),
				height: this.readUint32(),
				xOffset: this.readUint32(),
				yOffset: this.readUint32(),
				delayNumber: this.readUint16(),
				delayDenominator: this.readUint16(),
				disposeOp: this.readUint8(),
				blendOp: this.readUint8(),
				data: /* @__PURE__ */ new Uint8Array(0)
			};
			this._frames.push(image);
		}
		decodePLTE(length) {
			if (length % 3 !== 0) throw new RangeError(`PLTE field length must be a multiple of 3. Got ${length}`);
			const l = length / 3;
			this._hasPalette = true;
			const palette = [];
			this._palette = palette;
			for (let i = 0; i < l; i++) palette.push([
				this.readUint8(),
				this.readUint8(),
				this.readUint8()
			]);
		}
		decodeIDAT(length) {
			this._writingDataChunks = true;
			const dataLength = length;
			const dataOffset = this.offset + this.byteOffset;
			this._inflator.push(new Uint8Array(this.buffer, dataOffset, dataLength));
			if (this._inflator.err) throw new Error(`Error while decompressing the data: ${this._inflator.err}`);
			this.skip(length);
		}
		decodeFDAT(length) {
			this._writingDataChunks = true;
			let dataLength = length;
			let dataOffset = this.offset + this.byteOffset;
			dataOffset += 4;
			dataLength -= 4;
			this._inflator.push(new Uint8Array(this.buffer, dataOffset, dataLength));
			if (this._inflator.err) throw new Error(`Error while decompressing the data: ${this._inflator.err}`);
			this.skip(length);
		}
		decodetRNS(length) {
			switch (this._colorType) {
				case ColorType.GREYSCALE:
				case ColorType.TRUECOLOUR:
					if (length % 2 !== 0) throw new RangeError(`tRNS chunk length must be a multiple of 2. Got ${length}`);
					if (length / 2 > this._png.width * this._png.height) throw new Error(`tRNS chunk contains more alpha values than there are pixels (${length / 2} vs ${this._png.width * this._png.height})`);
					this._hasTransparency = true;
					this._transparency = new Uint16Array(length / 2);
					for (let i = 0; i < length / 2; i++) this._transparency[i] = this.readUint16();
					break;
				case ColorType.INDEXED_COLOUR: {
					if (length > this._palette.length) throw new Error(`tRNS chunk contains more alpha values than there are palette colors (${length} vs ${this._palette.length})`);
					let i = 0;
					for (; i < length; i++) {
						const alpha = this.readByte();
						this._palette[i].push(alpha);
					}
					for (; i < this._palette.length; i++) this._palette[i].push(255);
					break;
				}
				case ColorType.UNKNOWN:
				case ColorType.GREYSCALE_ALPHA:
				case ColorType.TRUECOLOUR_ALPHA:
				default: throw new Error(`tRNS chunk is not supported for color type ${this._colorType}`);
			}
		}
		decodeiCCP(length) {
			const name = readKeyword(this);
			const compressionMethod = this.readUint8();
			if (compressionMethod !== CompressionMethod.DEFLATE) throw new Error(`Unsupported iCCP compression method: ${compressionMethod}`);
			const compressedProfile = this.readBytes(length - name.length - 2);
			this._png.iccEmbeddedProfile = {
				name,
				profile: inflate_1(compressedProfile)
			};
		}
		decodepHYs() {
			const ppuX = this.readUint32();
			const ppuY = this.readUint32();
			const unitSpecifier = this.readByte();
			this._png.resolution = {
				x: ppuX,
				y: ppuY,
				unit: unitSpecifier
			};
		}
		decodeApngImage() {
			this._apng.width = this._png.width;
			this._apng.height = this._png.height;
			this._apng.channels = this._png.channels;
			this._apng.depth = this._png.depth;
			this._apng.numberOfFrames = this._numberOfFrames;
			this._apng.numberOfPlays = this._numberOfPlays;
			this._apng.text = this._png.text;
			this._apng.resolution = this._png.resolution;
			for (let i = 0; i < this._numberOfFrames; i++) {
				const newFrame = {
					sequenceNumber: this._frames[i].sequenceNumber,
					delayNumber: this._frames[i].delayNumber,
					delayDenominator: this._frames[i].delayDenominator,
					data: this._apng.depth === 8 ? new Uint8Array(this._apng.width * this._apng.height * this._apng.channels) : new Uint16Array(this._apng.width * this._apng.height * this._apng.channels)
				};
				const frame = this._frames.at(i);
				if (frame) {
					frame.data = decodeInterlaceNull({
						data: frame.data,
						width: frame.width,
						height: frame.height,
						channels: this._apng.channels,
						depth: this._apng.depth
					});
					if (this._hasPalette) this._apng.palette = this._palette;
					if (this._hasTransparency) this._apng.transparency = this._transparency;
					if (i === 0 || frame.xOffset === 0 && frame.yOffset === 0 && frame.width === this._png.width && frame.height === this._png.height) newFrame.data = frame.data;
					else {
						const prevFrame = this._apng.frames.at(i - 1);
						this.disposeFrame(frame, prevFrame, newFrame);
						this.addFrameDataToCanvas(newFrame, frame);
					}
					this._apng.frames.push(newFrame);
				}
			}
			return this._apng;
		}
		disposeFrame(frame, prevFrame, imageFrame) {
			switch (frame.disposeOp) {
				case DisposeOpType.NONE: break;
				case DisposeOpType.BACKGROUND:
					for (let row = 0; row < this._png.height; row++) for (let col = 0; col < this._png.width; col++) {
						const index = (row * frame.width + col) * this._png.channels;
						for (let channel = 0; channel < this._png.channels; channel++) imageFrame.data[index + channel] = 0;
					}
					break;
				case DisposeOpType.PREVIOUS:
					imageFrame.data.set(prevFrame.data);
					break;
				default: throw new Error("Unknown disposeOp");
			}
		}
		addFrameDataToCanvas(imageFrame, frame) {
			const maxValue = 1 << this._png.depth;
			const calculatePixelIndices = (row, col) => {
				return {
					index: ((row + frame.yOffset) * this._png.width + frame.xOffset + col) * this._png.channels,
					frameIndex: (row * frame.width + col) * this._png.channels
				};
			};
			switch (frame.blendOp) {
				case BlendOpType.SOURCE:
					for (let row = 0; row < frame.height; row++) for (let col = 0; col < frame.width; col++) {
						const { index, frameIndex } = calculatePixelIndices(row, col);
						for (let channel = 0; channel < this._png.channels; channel++) imageFrame.data[index + channel] = frame.data[frameIndex + channel];
					}
					break;
				case BlendOpType.OVER:
					for (let row = 0; row < frame.height; row++) for (let col = 0; col < frame.width; col++) {
						const { index, frameIndex } = calculatePixelIndices(row, col);
						for (let channel = 0; channel < this._png.channels; channel++) {
							const sourceAlpha = frame.data[frameIndex + this._png.channels - 1] / maxValue;
							const foregroundValue = channel % (this._png.channels - 1) === 0 ? 1 : frame.data[frameIndex + channel];
							const value = Math.floor(sourceAlpha * foregroundValue + (1 - sourceAlpha) * imageFrame.data[index + channel]);
							imageFrame.data[index + channel] += value;
						}
					}
					break;
				default: throw new Error("Unknown blendOp");
			}
		}
		decodeImage() {
			if (this._inflator.err) throw new Error(`Error while decompressing the data: ${this._inflator.err}`);
			const data = this._isAnimated ? (this._frames?.at(0)).data : this._inflator.result;
			if (this._filterMethod !== FilterMethod.ADAPTIVE) throw new Error(`Filter method ${this._filterMethod} not supported`);
			if (this._interlaceMethod === InterlaceMethod.NO_INTERLACE) this._png.data = decodeInterlaceNull({
				data,
				width: this._png.width,
				height: this._png.height,
				channels: this._png.channels,
				depth: this._png.depth
			});
			else if (this._interlaceMethod === InterlaceMethod.ADAM7) this._png.data = decodeInterlaceAdam7({
				data,
				width: this._png.width,
				height: this._png.height,
				channels: this._png.channels,
				depth: this._png.depth
			});
			else throw new Error(`Interlace method ${this._interlaceMethod} not supported`);
			if (this._hasPalette) this._png.palette = this._palette;
			if (this._hasTransparency) this._png.transparency = this._transparency;
		}
		pushDataToFrame() {
			const result = this._inflator.result;
			const lastFrame = this._frames.at(-1);
			if (lastFrame) lastFrame.data = result;
			else this._frames.push({
				sequenceNumber: 0,
				width: this._png.width,
				height: this._png.height,
				xOffset: 0,
				yOffset: 0,
				delayNumber: 0,
				delayDenominator: 0,
				disposeOp: DisposeOpType.NONE,
				blendOp: BlendOpType.SOURCE,
				data: result
			});
			this._inflator = new Inflate_1();
			this._writingDataChunks = false;
		}
	};
}));
//#endregion
//#region node_modules/fast-png/lib-esm/PngEncoder.js
function checkInteger(value, name) {
	if (Number.isInteger(value) && value > 0) return value;
	throw new TypeError(`${name} must be a positive integer`);
}
function getColorType(data, palette) {
	const { channels = 4, depth = 8 } = data;
	if (channels !== 4 && channels !== 3 && channels !== 2 && channels !== 1) throw new RangeError(`unsupported number of channels: ${channels}`);
	const returnValue = {
		channels,
		depth,
		colorType: ColorType.UNKNOWN
	};
	switch (channels) {
		case 4:
			returnValue.colorType = ColorType.TRUECOLOUR_ALPHA;
			break;
		case 3:
			returnValue.colorType = ColorType.TRUECOLOUR;
			break;
		case 1:
			if (palette) returnValue.colorType = ColorType.INDEXED_COLOUR;
			else returnValue.colorType = ColorType.GREYSCALE;
			break;
		case 2:
			returnValue.colorType = ColorType.GREYSCALE_ALPHA;
			break;
		default: throw new Error("unsupported number of channels");
	}
	return returnValue;
}
function writeDataBytes(data, newData, slotsPerLine, offset) {
	for (let j = 0; j < slotsPerLine; j++) newData.writeByte(data[offset++]);
	return offset;
}
function writeDataInterlaced(imageData, data, newData, offset) {
	const passes = [
		{
			x: 0,
			y: 0,
			xStep: 8,
			yStep: 8
		},
		{
			x: 4,
			y: 0,
			xStep: 8,
			yStep: 8
		},
		{
			x: 0,
			y: 4,
			xStep: 4,
			yStep: 8
		},
		{
			x: 2,
			y: 0,
			xStep: 4,
			yStep: 4
		},
		{
			x: 0,
			y: 2,
			xStep: 2,
			yStep: 4
		},
		{
			x: 1,
			y: 0,
			xStep: 2,
			yStep: 2
		},
		{
			x: 0,
			y: 1,
			xStep: 1,
			yStep: 2
		}
	];
	const { width, height, channels, depth } = imageData;
	let pixelSize = 0;
	if (depth === 16) pixelSize = channels * depth / 8 / 2;
	else pixelSize = channels * depth / 8;
	for (let passIndex = 0; passIndex < 7; passIndex++) {
		const pass = passes[passIndex];
		const passWidth = Math.floor((width - pass.x + pass.xStep - 1) / pass.xStep);
		const passHeight = Math.floor((height - pass.y + pass.yStep - 1) / pass.yStep);
		if (passWidth <= 0 || passHeight <= 0) continue;
		const passLineBytes = passWidth * pixelSize;
		for (let y = 0; y < passHeight; y++) {
			const imageY = pass.y + y * pass.yStep;
			const rawScanline = depth <= 8 ? new Uint8Array(passLineBytes) : new Uint16Array(passLineBytes);
			let rawOffset = 0;
			for (let x = 0; x < passWidth; x++) {
				const imageX = pass.x + x * pass.xStep;
				if (imageX < width && imageY < height) {
					const srcPos = (imageY * width + imageX) * pixelSize;
					for (let i = 0; i < pixelSize; i++) rawScanline[rawOffset++] = data[srcPos + i];
				}
			}
			newData.writeByte(0);
			if (depth === 8) newData.writeBytes(rawScanline);
			else if (depth === 16) for (const value of rawScanline) {
				newData.writeByte(value >> 8 & 255);
				newData.writeByte(value & 255);
			}
		}
	}
	return offset;
}
function writeDataUint16(data, newData, slotsPerLine, offset) {
	for (let j = 0; j < slotsPerLine; j++) newData.writeUint16(data[offset++]);
	return offset;
}
var defaultZlibOptions, PngEncoder;
var init_PngEncoder = __esmMin((() => {
	init_IOBuffer();
	init_pako_esm();
	init_crc();
	init_signature();
	init_text();
	init_internalTypes();
	defaultZlibOptions = { level: 3 };
	PngEncoder = class extends IOBuffer {
		_png;
		_zlibOptions;
		_colorType;
		_interlaceMethod;
		constructor(data, options = {}) {
			super();
			this._colorType = ColorType.UNKNOWN;
			this._zlibOptions = {
				...defaultZlibOptions,
				...options.zlib
			};
			this._png = this._checkData(data);
			this._interlaceMethod = (options.interlace === "Adam7" ? InterlaceMethod.ADAM7 : InterlaceMethod.NO_INTERLACE) ?? InterlaceMethod.NO_INTERLACE;
			this.setBigEndian();
		}
		encode() {
			writeSignature(this);
			this.encodeIHDR();
			if (this._png.palette) {
				this.encodePLTE();
				if (this._png.palette[0].length === 4) this.encodeTRNS();
			}
			this.encodeData();
			if (this._png.text) for (const [keyword, text] of Object.entries(this._png.text)) encodetEXt(this, keyword, text);
			this.encodeIEND();
			return this.toArray();
		}
		encodeIHDR() {
			this.writeUint32(13);
			this.writeChars("IHDR");
			this.writeUint32(this._png.width);
			this.writeUint32(this._png.height);
			this.writeByte(this._png.depth);
			this.writeByte(this._colorType);
			this.writeByte(CompressionMethod.DEFLATE);
			this.writeByte(FilterMethod.ADAPTIVE);
			this.writeByte(this._interlaceMethod);
			writeCrc(this, 17);
		}
		encodeIEND() {
			this.writeUint32(0);
			this.writeChars("IEND");
			writeCrc(this, 4);
		}
		encodePLTE() {
			const paletteLength = this._png.palette?.length * 3;
			this.writeUint32(paletteLength);
			this.writeChars("PLTE");
			for (const color of this._png.palette) {
				this.writeByte(color[0]);
				this.writeByte(color[1]);
				this.writeByte(color[2]);
			}
			writeCrc(this, 4 + paletteLength);
		}
		encodeTRNS() {
			const alpha = this._png.palette.filter((color) => {
				return color.at(-1) !== 255;
			});
			this.writeUint32(alpha.length);
			this.writeChars("tRNS");
			for (const el of alpha) this.writeByte(el.at(-1));
			writeCrc(this, 4 + alpha.length);
		}
		encodeIDAT(data) {
			this.writeUint32(data.length);
			this.writeChars("IDAT");
			this.writeBytes(data);
			writeCrc(this, data.length + 4);
		}
		encodeData() {
			const { width, height, channels, depth, data } = this._png;
			const slotsPerLine = depth <= 8 ? Math.ceil(width * depth / 8) * channels : Math.ceil(width * depth / 8 * channels / 2);
			const newData = new IOBuffer().setBigEndian();
			let offset = 0;
			if (this._interlaceMethod === InterlaceMethod.NO_INTERLACE) for (let i = 0; i < height; i++) {
				newData.writeByte(0);
				if (depth === 16) offset = writeDataUint16(data, newData, slotsPerLine, offset);
				else offset = writeDataBytes(data, newData, slotsPerLine, offset);
			}
			else if (this._interlaceMethod === InterlaceMethod.ADAM7) offset = writeDataInterlaced(this._png, data, newData, offset);
			const buffer = newData.toArray();
			const compressed = deflate_1(buffer, this._zlibOptions);
			this.encodeIDAT(compressed);
		}
		_checkData(data) {
			const { colorType, channels, depth } = getColorType(data, data.palette);
			const png = {
				width: checkInteger(data.width, "width"),
				height: checkInteger(data.height, "height"),
				channels,
				data: data.data,
				depth,
				text: data.text,
				palette: data.palette
			};
			this._colorType = colorType;
			const expectedSize = depth < 8 ? Math.ceil(png.width * depth / 8) * png.height * channels : png.width * png.height * channels;
			if (png.data.length !== expectedSize) throw new RangeError(`wrong data size. Found ${png.data.length}, expected ${expectedSize}`);
			return png;
		}
	};
}));
//#endregion
//#region node_modules/fast-png/lib-esm/types.js
var ResolutionUnitSpecifier;
var init_types = __esmMin((() => {
	(function(ResolutionUnitSpecifier) {
		/**
		* Unit is unknown
		*/
		ResolutionUnitSpecifier[ResolutionUnitSpecifier["UNKNOWN"] = 0] = "UNKNOWN";
		/**
		* Unit is the metre
		*/
		ResolutionUnitSpecifier[ResolutionUnitSpecifier["METRE"] = 1] = "METRE";
	})(ResolutionUnitSpecifier || (ResolutionUnitSpecifier = {}));
}));
//#endregion
//#region node_modules/fast-png/lib-esm/convertIndexedToRgb.js
/**
* Converts indexed data into RGB/RGBA format
* @param decodedImage - Image to decode data from.
* @returns Uint8Array with RGB data.
*/
function convertIndexedToRgb(decodedImage) {
	const palette = decodedImage.palette;
	const depth = decodedImage.depth;
	if (!palette) throw new Error("Color palette is undefined.");
	checkDataSize(decodedImage);
	const indexSize = decodedImage.width * decodedImage.height;
	const resSize = indexSize * palette[0].length;
	const res = new Uint8Array(resSize);
	let indexPos = 0;
	let offset = 0;
	const indexes = new Uint8Array(indexSize);
	let bit = 255;
	switch (depth) {
		case 1:
			bit = 128;
			break;
		case 2:
			bit = 192;
			break;
		case 4:
			bit = 240;
			break;
		case 8:
			bit = 255;
			break;
		default: throw new Error("Incorrect depth value");
	}
	for (const byte of decodedImage.data) {
		let bit2 = bit;
		let shift = 8;
		while (bit2) {
			shift -= depth;
			indexes[indexPos++] = (byte & bit2) >> shift;
			bit2 = bit2 >> depth;
			if (indexPos % decodedImage.width === 0) break;
		}
	}
	if (decodedImage.palette) for (const index of indexes) {
		const color = decodedImage.palette.at(index);
		if (!color) throw new Error("Incorrect index of palette color");
		res.set(color, offset);
		offset += color.length;
	}
	return res;
}
function checkDataSize(image) {
	const expectedSize = image.depth < 8 ? Math.ceil(image.width * image.depth / 8) * image.height * image.channels : image.width * image.height * image.channels;
	if (image.data.length !== expectedSize) throw new RangeError(`wrong data size. Found ${image.data.length}, expected ${expectedSize}`);
}
var init_convertIndexedToRgb = __esmMin((() => {}));
//#endregion
//#region node_modules/fast-png/lib-esm/index.js
var lib_esm_exports = /* @__PURE__ */ __exportAll({
	ResolutionUnitSpecifier: () => ResolutionUnitSpecifier,
	convertIndexedToRgb: () => convertIndexedToRgb,
	decode: () => decodePng,
	decodeApng: () => decodeApng,
	encode: () => encodePng,
	hasPngSignature: () => hasPngSignature
});
function decodePng(data, options) {
	return new PngDecoder(data, options).decode();
}
function encodePng(png, options) {
	return new PngEncoder(png, options).encode();
}
function decodeApng(data, options) {
	return new PngDecoder(data, options).decodeApng();
}
var init_lib_esm = __esmMin((() => {
	init_PngDecoder();
	init_PngEncoder();
	init_signature();
	init_types();
	init_convertIndexedToRgb();
}));
//#endregion
export { lib_esm_exports as n, init_lib_esm as t };
