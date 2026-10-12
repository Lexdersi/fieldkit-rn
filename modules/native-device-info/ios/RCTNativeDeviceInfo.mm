// Must be .mm (Objective-C++), not .m: getTurboModule: returns a C++ type.
#import "RCTNativeDeviceInfo.h"
#import <UIKit/UIKit.h>
#import <sys/utsname.h>

@implementation RCTNativeDeviceInfo

- (instancetype)init
{
  if (self = [super init]) {
    // UIDevice is a main-thread API. Battery monitoring is off by default and
    // batteryLevel reads -1 until it is enabled, so the first call may say "unknown".
    dispatch_async(dispatch_get_main_queue(), ^{
      [UIDevice currentDevice].batteryMonitoringEnabled = YES;
    });
  }
  return self;
}

// Must match the string in TurboModuleRegistry.get and the codegenConfig provider key
+ (NSString *)moduleName
{
  return @"NativeDeviceInfo";
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeDeviceInfoSpecJSI>(params);
}

// Synchronous spec methods returning number/boolean are NSNumber * on iOS
- (NSNumber *)getBatteryLevel
{
  float level = [UIDevice currentDevice].batteryLevel; // -1 on Simulator or when unknown
  return @(level < 0 ? -1.0 : level);
}

- (NSString *)getModel
{
  // Hardware identifier, e.g. "iPhone15,2". UIDevice.model only says "iPhone".
  struct utsname info;
  uname(&info);
  NSString *machine = [NSString stringWithCString:info.machine encoding:NSUTF8StringEncoding];
#if TARGET_OS_SIMULATOR
  machine = NSProcessInfo.processInfo.environment[@"SIMULATOR_MODEL_IDENTIFIER"] ?: machine;
#endif
  return [NSString stringWithFormat:@"Apple %@", machine];
}

- (NSNumber *)isEmulator
{
#if TARGET_OS_SIMULATOR
  return @YES;
#else
  return @NO;
#endif
}

@end
