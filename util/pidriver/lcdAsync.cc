#include <node.h>
#include <node_buffer.h>
#include <nan.h>
#include <wiringPi.h>
#include <lcd.h>
#include <string.h>
#include <errno.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;
using v8::Number;
using v8::String;

//lcdInit
class LcdInitAsync : public NanAsyncWorker {
	public:
	LcdInitAsync(NanCallback *callback, int rows, int cols, int bits, int rs, int strb, int d0, int d1, int d2, int d3, int d4, int d5, int d6, int d7)
	: NanAsyncWorker(callback) {}
	~LcdInitAsync() {}

	void Execute () {
		ret = lcdInit(rows,cols,bits,rs,strb,d0,d1,d2,d3,d4,d5,d6,d7);		
		if(ret==-1) {
			SetErrorMessage(strerror(errno));
		}
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[2];
		argv[0] = NanNull();
		argv[1] = NanNew<Number>(ret);

		callback->Call(2, argv);
	}

	private:
	int rows;
    int cols;
    int bits;
    int rs;
    int strb;
    int d0;
    int d1;
    int d2;
    int d3;
    int d4;
    int d5;
    int d6;
    int d7;
    int ret;
};

NAN_METHOD(lcdInitAsync) {
	NanScope();

	if ( args.Length() != 14  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() || !args[3]->IsInt32() || !args[4]->IsInt32() || !args[5]->IsInt32() || !args[6]->IsInt32() || !args[7]->IsInt32() || !args[8]->IsInt32() || !args[9]->IsInt32() || !args[10]->IsInt32() || !args[11]->IsInt32() || !args[12]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[13].As<Function>());
	int rows = args[0]->Int32Value();
	int cols = args[1]->Int32Value();
	int bits = args[2]->Int32Value();
	int rs = args[3]->Int32Value();
	int strb = args[4]->Int32Value();
	int d0 = args[5]->Int32Value();
	int d1 = args[6]->Int32Value();
	int d2 = args[7]->Int32Value();
	int d3 = args[8]->Int32Value();
	int d4 = args[9]->Int32Value();
	int d5 = args[10]->Int32Value();
	int d6 = args[11]->Int32Value();
	int d7 = args[12]->Int32Value();
	
	NanAsyncQueueWorker(new LcdInitAsync(callback, rows, cols, bits, rs, strb, d0, d1, d2, d3, d4, d5, d6, d7));
	NanReturnUndefined();
}

//lcdClear
class LcdClearAsync : public NanAsyncWorker {
	public:
	LcdClearAsync(NanCallback *callback, int fd)
	: NanAsyncWorker(callback) {}
	~LcdClearAsync() {}

	void Execute () {
		lcdClear(fd);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int fd;
    
};

NAN_METHOD(lcdClearAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int fd = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new LcdClearAsync(callback, fd));
	NanReturnUndefined();
}

//lcdHome
class LcdHomeAsync : public NanAsyncWorker {
	public:
	LcdHomeAsync(NanCallback *callback, int fd)
	: NanAsyncWorker(callback) {}
	~LcdHomeAsync() {}

	void Execute () {
		lcdHome(fd);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int fd;
    
};

NAN_METHOD(lcdHomeAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int fd = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new LcdHomeAsync(callback, fd));
	NanReturnUndefined();
}

//lcdPosition
class LcdPositionAsync : public NanAsyncWorker {
	public:
	LcdPositionAsync(NanCallback *callback, int fd, int x, int y)
	: NanAsyncWorker(callback) {}
	~LcdPositionAsync() {}

	void Execute () {
		lcdPosition(fd,x,y);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int fd;
    int x;
    int y;
    
};

NAN_METHOD(lcdPositionAsync) {
	NanScope();

	if ( args.Length() != 4  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[3].As<Function>());
	int fd = args[0]->Int32Value();
	int x = args[1]->Int32Value();
	int y = args[2]->Int32Value();
	
	NanAsyncQueueWorker(new LcdPositionAsync(callback, fd, x, y));
	NanReturnUndefined();
}

//lcdPuts
class LcdPutsAsync : public NanAsyncWorker {
	public:
	LcdPutsAsync(NanCallback *callback, int fd, char* string)
	: NanAsyncWorker(callback) {}
	~LcdPutsAsync() {}

	void Execute () {
		lcdPuts(fd,string);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int fd;
    char* string;
    
};

NAN_METHOD(lcdPutsAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsObject() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int fd = args[0]->Int32Value();
	size_t len = node::Buffer::Length(args[1]->ToObject());
	char* string = node::Buffer::Data(args[1]->ToObject());
    string[len] = '\0';
	
	NanAsyncQueueWorker(new LcdPutsAsync(callback, fd, string));
	NanReturnUndefined();
}