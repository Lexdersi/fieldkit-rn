require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "native-device-info"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = "https://github.com/Lexdersi/fieldkit-rn"
  s.license      = package["license"]
  s.authors      = "FieldKit"
  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/Lexdersi/fieldkit-rn.git", :tag => s.version.to_s }
  s.source_files = "ios/**/*.{h,m,mm}"

  # Pulls in React-Core, the codegen'd spec headers and the New Architecture deps
  install_modules_dependencies(s)
end
