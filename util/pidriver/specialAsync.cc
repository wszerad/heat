#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <mcp23s17.h>
#include <string.h>
#include <errno.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;
using v8::Number;
using v8::String;

//mcp23s17SetupAsync
class Mcp23s17SetupAsync : public NanAsyncWorker {
	public:
	Mcp23s17SetupAsync(NanCallback *callback, int pinBase, int spiPort, int devId)
	: NanAsyncWorker(callback) {}
	~Mcp23s17SetupAsync() {}

	void Execute () {
		ret = mcp23s17Setup(pinBase,spiPort,devId);		
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
	int pinBase;
    int spiPort;
    int devId;
    int ret;
};

NAN_METHOD(mcp23s17SetupAsync) {
	NanScope();

	if ( args.Length() != 4  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[3].As<Function>());
	int pinBase = args[0]->Int32Value();
	int spiPort = args[1]->Int32Value();
	int devId = args[2]->Int32Value();
	
	NanAsyncQueueWorker(new Mcp23s17SetupAsync(callback, pinBase, spiPort, devId));
	NanReturnUndefined();
}