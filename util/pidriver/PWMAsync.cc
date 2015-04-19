#include <node.h>
#include <nan.h>
#include <wiringPi.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;

//pwmSetModeAsync
class PwmSetModeAsync : public NanAsyncWorker {
	public:
	PwmSetModeAsync(NanCallback *callback, int mode)
	: NanAsyncWorker(callback) {}
	~PwmSetModeAsync() {}

	void Execute () {
		pwmSetMode(mode);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int mode;
    
};

NAN_METHOD(pwmSetModeAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int mode = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new PwmSetModeAsync(callback, mode));
	NanReturnUndefined();
}

//pwmSetClockAsync
class PwmSetClockAsync : public NanAsyncWorker {
	public:
	PwmSetClockAsync(NanCallback *callback, int divisor)
	: NanAsyncWorker(callback) {}
	~PwmSetClockAsync() {}

	void Execute () {
		pwmSetClock(divisor);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int divisor;
    
};

NAN_METHOD(pwmSetClockAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int divisor = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new PwmSetClockAsync(callback, divisor));
	NanReturnUndefined();
}

//pwmSetRangeAsync
class PwmSetRangeAsync : public NanAsyncWorker {
	public:
	PwmSetRangeAsync(NanCallback *callback, int range)
	: NanAsyncWorker(callback) {}
	~PwmSetRangeAsync() {}

	void Execute () {
		pwmSetRange(range);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int range;
    
};

NAN_METHOD(pwmSetRangeAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int range = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new PwmSetRangeAsync(callback, range));
	NanReturnUndefined();
}

//pwmWriteAsync
class PwmWriteAsync : public NanAsyncWorker {
	public:
	PwmWriteAsync(NanCallback *callback, int pin, int value)
	: NanAsyncWorker(callback) {}
	~PwmWriteAsync() {}

	void Execute () {
		pwmWrite(pin,value);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int pin;
    int value;
    
};

NAN_METHOD(pwmWriteAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int pin = args[0]->Int32Value();
	int value = args[1]->Int32Value();
	
	NanAsyncQueueWorker(new PwmWriteAsync(callback, pin, value));
	NanReturnUndefined();
}