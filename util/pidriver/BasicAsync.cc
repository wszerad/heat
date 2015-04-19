#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <string.h>
#include <errno.h>

using v8::Function;
using v8::Local;
using v8::Null;
using v8::Value;
using v8::Number;
using v8::String;

//wiringPiSetupGpioAsync
class WiringPiSetupGpioAsync : public NanAsyncWorker {
	public:
	WiringPiSetupGpioAsync(NanCallback *callback)
	: NanAsyncWorker(callback) {}
	~WiringPiSetupGpioAsync() {}

	void Execute () {
		ret = wiringPiSetupGpio();		
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
	int ret;
};

NAN_METHOD(wiringPiSetupGpioAsync) {
	NanScope();

	if ( args.Length() != 1  ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[0].As<Function>());
	
	NanAsyncQueueWorker(new WiringPiSetupGpioAsync(callback));
	NanReturnUndefined();
}

//pullUpDnControlAsync
class PullUpDnControlAsync : public NanAsyncWorker {
	public:
	PullUpDnControlAsync(NanCallback *callback, int pin, int pud)
	: NanAsyncWorker(callback) {}
	~PullUpDnControlAsync() {}

	void Execute () {
		pullUpDnControl(pin,pud);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int pin;
    int pud;
    
};

NAN_METHOD(pullUpDnControlAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int pin = args[0]->Int32Value();
	int pud = args[1]->Int32Value();
	
	NanAsyncQueueWorker(new PullUpDnControlAsync(callback, pin, pud));
	NanReturnUndefined();
}

//digitalReadAsync
class DigitalReadAsync : public NanAsyncWorker {
	public:
	DigitalReadAsync(NanCallback *callback, int pin)
	: NanAsyncWorker(callback) {}
	~DigitalReadAsync() {}

	void Execute () {
		ret = digitalRead(pin);		
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
	int pin;
    int ret;
};

NAN_METHOD(digitalReadAsync) {
	NanScope();

	if ( args.Length() != 2  || !args[0]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[1].As<Function>());
	int pin = args[0]->Int32Value();
	
	NanAsyncQueueWorker(new DigitalReadAsync(callback, pin));
	NanReturnUndefined();
}

//digitalWriteAsync
class DigitalWriteAsync : public NanAsyncWorker {
	public:
	DigitalWriteAsync(NanCallback *callback, int pin, int value)
	: NanAsyncWorker(callback) {}
	~DigitalWriteAsync() {}

	void Execute () {
		digitalWrite(pin,value);		
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

NAN_METHOD(digitalWriteAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int pin = args[0]->Int32Value();
	int value = args[1]->Int32Value();
	
	NanAsyncQueueWorker(new DigitalWriteAsync(callback, pin, value));
	NanReturnUndefined();
}

//pinModeAsync
class PinModeAsync : public NanAsyncWorker {
	public:
	PinModeAsync(NanCallback *callback, int pin, int mode)
	: NanAsyncWorker(callback) {}
	~PinModeAsync() {}

	void Execute () {
		pinMode(pin,mode);		
	}

	void HandleOKCallback () {
		NanScope();

		Local<Value> argv[1];
		argv[0] = NanNull();

		callback->Call(1, argv);
	}

	private:
	int pin;
    int mode;
    
};

NAN_METHOD(pinModeAsync) {
	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	NanCallback *callback = new NanCallback(args[2].As<Function>());
	int pin = args[0]->Int32Value();
	int mode = args[1]->Int32Value();
	
	NanAsyncQueueWorker(new PinModeAsync(callback, pin, mode));
	NanReturnUndefined();
}