#include <node.h>
#include <node_buffer.h>
#include <nan.h>
#include <wiringPi.h>
#include <wiringPiSPI.h>
#include <string.h>
#include <errno.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;
using v8::Number;
using v8::String;

//wiringPiSPIDataRWAsync
class WiringPiSPIDataRWAsync : public NanAsyncWorker {
	public:
	WiringPiSPIDataRWAsync(NanCallback *callback, int channel, char* data, int len)
	: NanAsyncWorker(callback) {}
	~WiringPiSPIDataRWAsync() {}

	void Execute () {
		ret = wiringPiSPIDataRW(channel, (unsigned char*)data, len);		
		if(ret==-1) {
			SetErrorMessage(strerror(errno));
		}
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[2];
		argv[0] = NanNull();
		argv[1] = NanNewBufferHandle(data, len);

		callback->Call(2, argv);
	}

	private:
	int channel;
    char* data;
    int len;
    int ret;
};

NAN_METHOD(wiringPiSPIDataRWAsync) {
	NanScope();

	if ( args.Length() != 4  || !args[0]->IsInt32() || !args[1]->IsObject() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[3].As<Function>());
	int channel = args[0]->Int32Value();
	char* data = node::Buffer::Data(args[1]->ToObject());
	int len = args[2]->Int32Value();
	
	NanAsyncQueueWorker(new WiringPiSPIDataRWAsync(callback, channel, data, len));
	NanReturnUndefined();
}

//wiringPiSPISetupAsync
class WiringPiSPISetupAsync : public NanAsyncWorker {
	public:
	WiringPiSPISetupAsync(NanCallback *callback, int channel, int speed)
	: NanAsyncWorker(callback) {}
	~WiringPiSPISetupAsync() {}

	void Execute () {
		ret = wiringPiSPISetup(channel,speed);		
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
	int channel;
    int speed;
    int ret;
};

NAN_METHOD(wiringPiSPISetupAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int channel = args[0]->Int32Value();
	int speed = args[1]->Int32Value();
	
	NanAsyncQueueWorker(new WiringPiSPISetupAsync(callback, channel, speed));
	NanReturnUndefined();
}
