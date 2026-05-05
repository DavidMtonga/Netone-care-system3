export interface DeviceOption {
  model: string
  type: 'Laptop' | 'Phone' | 'Desktop' | 'Tablet'
  category: string
}

export const NETONE_DEVICES: DeviceOption[] = [
  { model: 'Neo Lite 14',          type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Lite 14a',         type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Lite 14S',         type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Lite 14P',         type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Pro 15 Inspire',   type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Pro 15',           type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Pro 15P',          type: 'Laptop',  category: 'laptop' },
  { model: 'Neo Pulse 5',          type: 'Phone',   category: 'phone' },
  { model: 'Neo Pulse 7',          type: 'Phone',   category: 'phone' },
  { model: 'All in One Desktop - Neo Fusion A5', type: 'Desktop', category: 'desktop' },
  { model: 'Neo Tablet T606',      type: 'Tablet',  category: 'tablet' },
]

export const DEVICE_PROBLEMS: Record<string, string[]> = {
  laptop: ['Overheating','Wi-Fi / Driver Issue','Screen / Display Fault','Battery Not Charging','Keyboard / Touchpad Issue','Slow Performance','Mic / Camera Not Working','USB Ports Not Working','Hinge / Physical Damage','OS / Software Error','No Power / Won\'t Boot','Fan Noise'],
  phone:  ['Screen / Display Issue','Battery Draining Fast','Charging Problem','Speaker / Mic Fault','Call Quality Issues','Camera Not Working','Software / OS Issue','No Power'],
  desktop:['No Display / Video Output','Computer Won\'t Boot','Overheating / Fan Noise','USB / Port Issue','Keyboard / Mouse Not Working','Software / OS Error','Network / Wi-Fi Issue'],
  tablet: ['Touch Screen Unresponsive','Charging Port Fault','Speaker / Audio Issue','App Crashes','Wi-Fi Not Connecting','Camera Fault','Battery Issue','Screen Damage'],
}

export const getDeviceCategory = (model: string): string => {
  const d = NETONE_DEVICES.find(x => x.model === model)
  return d?.category ?? 'laptop'
}
