import Foundation
import CoreMotion
import CoreLocation
import React

@objc(Compass)
class Compass: RCTEventEmitter {
  var matrixArray = [CMRotationMatrix]()
  var motion = CMMotionManager()
  let locationManager = CLLocationManager()

  override init() {
    super.init()
    locationManager.requestWhenInUseAuthorization()
  }

  @objc
  func getDeviceRotation() {
    guard motion.isDeviceMotionAvailable else { return }

    let referenceFrame = CMAttitudeReferenceFrame.xTrueNorthZVertical
    guard CMMotionManager.availableAttitudeReferenceFrames().contains(referenceFrame) else { return }

    let queue = OperationQueue.main
    motion.deviceMotionUpdateInterval = 0.1
    motion.startDeviceMotionUpdates(using: referenceFrame, to: queue) { data, error in
      guard let data = data, error == nil else { return }

      let rotationMatrix = data.attitude.rotationMatrix
      self.matrixArray.append(rotationMatrix)

      if self.matrixArray.count > 5 {
        self.matrixArray.removeFirst()
      }

      let averages = [
        "M11": self.matrixArray.map { $0.m11 }.average(),
        "M12": self.matrixArray.map { $0.m12 }.average(),
        "M13": self.matrixArray.map { $0.m13 }.average(),
        "M21": self.matrixArray.map { $0.m21 }.average(),
        "M22": self.matrixArray.map { $0.m22 }.average(),
        "M23": self.matrixArray.map { $0.m23 }.average(),
        "M31": self.matrixArray.map { $0.m31 }.average(),
        "M32": self.matrixArray.map { $0.m32 }.average(),
        "M33": self.matrixArray.map { $0.m33 }.average()
      ]

      let heading = self.mod(value: data.heading - 270, degrees: 360).rounded(toPlaces: 0)

      self.sendEvent(withName: "rotationMatrix", body: averages.merging(["heading": heading], uniquingKeysWith: { $1 }))
    }
  }

  @objc
  func stopCompass() {
    motion.stopDeviceMotionUpdates()
    locationManager.stopUpdatingHeading()
    print("Compass stopped")
  }

  override func supportedEvents() -> [String]! {
    return ["rotationMatrix"]
  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  func mod(value: Double, degrees: Double) -> Double {
    return ((value.truncatingRemainder(dividingBy: degrees) + degrees).truncatingRemainder(dividingBy: degrees))
  }
}

private extension Array where Element == Double {
  func average() -> Double {
    guard !isEmpty else { return 0 }
    return reduce(0, +) / Double(count)
  }
}

private extension Double {
  func rounded(toPlaces places: Int) -> Double {
    let divisor = pow(10.0, Double(places))
    return (self * divisor).rounded() / divisor
  }
}
