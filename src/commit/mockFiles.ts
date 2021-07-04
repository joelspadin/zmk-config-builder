import { IFileChangeCardProps } from './FileChangeCard';

const oldConfigFile = `\
# Uncomment the following lines to enable the Corne RGB Underglow
# CONFIG_ZMK_RGB_UNDERGLOW=y
# CONFIG_WS2812_STRIP=y

# Uncomment the following line to enable the Corne OLED Display
# CONFIG_ZMK_DISPLAY=y
`;

const newConfigFile = `\
# Uncomment the following lines to enable the Corne RGB Underglow
CONFIG_ZMK_RGB_UNDERGLOW=y
CONFIG_WS2812_STRIP=y

# Uncomment the following line to enable the Corne OLED Display
CONFIG_ZMK_DISPLAY=y
`;

export const deleteConfigFile: IFileChangeCardProps = {
    original: {
        name: 'config/corne.conf',
        text: oldConfigFile,
    },
};

export const renameConfigFile: IFileChangeCardProps = {
    original: {
        name: 'corne.conf',
        text: oldConfigFile,
    },
    modified: {
        name: 'config/corne.conf',
        text: newConfigFile,
    },
};

const newBuildMatrix = `\
name: Build

on: [push, pull_request, workflow_dispatch]

jobs:
  build:
    runs-on: ubuntu-20.04
    container:
      image: zmkfirmware/zmk-build-arm:2.4
    strategy:
      fail-fast: false
      matrix:
        include:
          - board: nice_nano
            shield: corne_left
          - board: nice_nano
            shield: corne_right
          - board: numble
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Cache west modules
        uses: actions/cache@v2
        env:
          cache-name: cache-zephyr-modules
        with:
          path: |
            bootloader/
            modules/
            tools/
            zephyr/
            zmk/
          key: \${{ runner.os }}-build-\${{ env.cache-name }}-\${{ hashFiles('config/west.yml') }}
          restore-keys: |
            \${{ runner.os }}-build-\${{ env.cache-name }}-
            \${{ runner.os }}-build-
            \${{ runner.os }}-
        timeout-minutes: 2
        continue-on-error: true
      - name: Initialize workspace (west init)
        run: west init -l config
      - name: Update modules (west update)
        run: west update
      - name: Export Zephyr CMake package (west zephyr-export)
        run: west zephyr-export
      - name: Prepare variables
        id: variables
        run: |
          if [ -n "\${{ matrix.shield }}" ]; then
            SHIELD_ARG="-DSHIELD=\${{ matrix.shield }}"
            ARTIFACT_NAME="\${{ matrix.shield }}-\${{ matrix.board }}-zmk"
          else
            SHIELD_ARG=
            ARTIFACT_NAME="\${{ matrix.board }}-zmk"
          fi

          echo ::set-output name=shield-arg::\${SHIELD_ARG}
          echo ::set-output name=artifact-name::\${ARTIFACT_NAME}
      - name: Build (west build)
        run: west build -s zmk/app -b \${{ matrix.board }} -- \${{ steps.variables.outputs.shield-arg }} -DZMK_CONFIG="\${GITHUB_WORKSPACE}/config"
      - name: Generated DTS file
        if: always()
        run: cat -n build/zephyr/\${{ matrix.board }}.dts.pre.tmp
      - name: Archive artifacts
        uses: actions/upload-artifact@v2
        with:
          name: '\${{ steps.variables.outputs.artifact-name }}'
          path: |
            build/zephyr/zmk.hex
            build/zephyr/zmk.uf2
        continue-on-error: true
`;

const oldBuildMatrix = `\
name: Build

on: [push, pull_request, workflow_dispatch]

jobs:
  build:
    runs-on: ubuntu-20.04
    container:
      image: zmkfirmware/zmk-build-arm:2.4
    strategy:
      fail-fast: false
      matrix:
        include:
          - board: numble
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Cache west modules
        uses: actions/cache@v2
        env:
          cache-name: cache-zephyr-modules
        with:
          path: |
            bootloader/
            modules/
            tools/
            zephyr/
            zmk/
          key: \${{ runner.os }}-build-\${{ env.cache-name }}-\${{ hashFiles('config/west.yml') }}
          restore-keys: |
            \${{ runner.os }}-build-\${{ env.cache-name }}-
            \${{ runner.os }}-build-
            \${{ runner.os }}-
        timeout-minutes: 2
        continue-on-error: true
      - name: Initialize workspace (west init)
        run: west init -l config
      - name: Update modules (west update)
        run: west update
      - name: Export Zephyr CMake package (west zephyr-export)
        run: west zephyr-export
      - name: Prepare variables
        id: variables
        run: |
          if [ -n "\${{ matrix.shield }}" ]; then
            SHIELD_ARG="-DSHIELD=\${{ matrix.shield }}"
            ARTIFACT_NAME="\${{ matrix.shield }}-\${{ matrix.board }}-zmk"
          else
            SHIELD_ARG=
            ARTIFACT_NAME="\${{ matrix.board }}-zmk"
          fi

          echo ::set-output name=shield-arg::\${SHIELD_ARG}
          echo ::set-output name=artifact-name::\${ARTIFACT_NAME}
      - name: Build (west build)
        run: west build -s zmk/app -b \${{ matrix.board }} -- \${{ steps.variables.outputs.shield-arg }} -DZMK_CONFIG="\${GITHUB_WORKSPACE}/config"
      - name: Generated DTS file
        if: always()
        run: cat -n build/zephyr/\${{ matrix.board }}.dts.pre.tmp
      - name: Archive artifacts
        uses: actions/upload-artifact@v2
        with:
          name: '\${{ steps.variables.outputs.artifact-name }}'
          path: |
            build/zephyr/zmk.hex
            build/zephyr/zmk.uf2
        continue-on-error: true
`;

export const buildMatrixFile: IFileChangeCardProps = {
    original: {
        name: '.github/workflows/build.yml',
        text: oldBuildMatrix,
    },
    modified: {
        name: '.github/workflows/build.yml',
        text: newBuildMatrix,
    },
};

const newDts = `\
/**
 * Copyright (c) 2021 Joel Spadin
 *
 * SPDX-License-Identifier: MIT
 */

/dts-v1/;
#include <nordic/nrf52840_qiaa.dtsi>
#include <dt-bindings/zmk/matrix_transform.h>

/ {
    model = "NumBLE";
    compatible = "spadin,numble";

    chosen {
        zephyr,code-partition = &code_partition;
        zephyr,sram = &sram0;
        zephyr,flash = &flash0;
        zmk,kscan = &kscan0;
        zmk,matrix_transform = &transform_numpad_21;
        // TODO: get these drivers working in ZMK
        // zmk,battery = &vbatt;
        // zmk,battery = &fuel_gauge;
    };

    kscan0: kscan {
        compatible = "zmk,kscan-gpio-matrix";
        label = "KSCAN";

        diode-direction = "col2row";
        col-gpios
            = <&gpio0 29 GPIO_ACTIVE_HIGH>
            , <&gpio0 31 GPIO_ACTIVE_HIGH>
            , <&gpio0 30 GPIO_ACTIVE_HIGH>
            , <&gpio0 28 GPIO_ACTIVE_HIGH>
            ;
        row-gpios
            = <&gpio0 13 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            , <&gpio0  2 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            , <&gpio1 13 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            , <&gpio0  3 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            , <&gpio1 10 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            , <&gpio1 11 (GPIO_ACTIVE_HIGH | GPIO_PULL_DOWN)>
            ;
        test = <(1 << 2 + 3 >> 4 * 2 == 3) (1 <= 2 && 2 >= 3 ? 4 : 5)>;
    };

    // 21-key numpad
    transform_numpad_21: keymap_transform_0 {
        compatible = "zmk,matrix-transform";
        columns = <4>;
        rows = <6>;
        map = <
            RC(0,0) RC(0,1) RC(0,2) RC(0,3)
            RC(1,0) RC(1,1) RC(1,2) RC(1,3)
            RC(2,0) RC(2,1) RC(2,2) RC(2,3)
            RC(3,0) RC(3,1) RC(3,2)
            RC(4,0) RC(4,1) RC(4,2) RC(4,3)
            RC(5,0)         RC(5,2)
        >;
    };

    // 22-key numpad
    transform_numpad_22: keymap_transform_1 {
        compatible = "zmk,matrix-transform";
        columns = <4>;
        rows = <6>;
        map = <
            RC(0,0) RC(0,1) RC(0,2) RC(0,3)
            RC(1,0) RC(1,1) RC(1,2) RC(1,3)
            RC(2,0) RC(2,1) RC(2,2) RC(2,3)
            RC(3,0) RC(3,1) RC(3,2)
            RC(4,0) RC(4,1) RC(4,2) RC(4,3)
            RC(5,0) RC(5,1) RC(5,2)
        >;
    };

    // 24-key macropad
    transform_macropad: keymap_transform_2 {
        compatible = "zmk,matrix-transform";
        columns = <4>;
        rows = <6>;
        map = <
            RC(0,0) RC(0,1) RC(0,2) RC(0,3)
            RC(1,0) RC(1,1) RC(1,2) RC(1,3)
            RC(2,0) RC(2,1) RC(2,2) RC(2,3)
            RC(3,0) RC(3,1) RC(3,2) RC(3,3)
            RC(4,0) RC(4,1) RC(4,2) RC(4,3)
            RC(5,0) RC(5,1) RC(5,2) RC(5,3)
        >;
    };

    encoder: encoder {
        compatible = "apls,ec11";
        label = "ENCODER";
        a-gpios = <&gpio0 10 (GPIO_ACTIVE_HIGH | GPIO_PULL_UP)>;
        b-gpios = <&gpio0 24 (GPIO_ACTIVE_HIGH | GPIO_PULL_UP)>;
        resolution = <2>;
        status = "disabled";
    };

    leds {
        compatible = "gpio-leds";

        status_led: led_0 {
            label = "STATUS LED";
            gpios = <&gpio0 9 GPIO_ACTIVE_HIGH>;
        };
    };

    // TODO: Get this driver working in ZMK
    // vbatt: vbatt {
    //     compatible = "zmk,battery-nrf-vddh";
    //     label = "VBATT";
    // };
};

&adc {
    status = "okay";
};

&gpiote {
    status = "okay";
};

&gpio0 {
    status = "okay";
};

&gpio1 {
    status = "okay";
};

&i2c0 {
    compatible = "nordic,nrf-twi";
    status = "okay";
    sda-pin = <(32 + 9)>;
    scl-pin = <5>;
    // TODO: Zephyr 2.5
    // sda-gpios = <&gpio1 9 0>;
    // scl-gpios = <&gpio0 5 0>;

    fuel_gauge: max17055@36 {
        compatible = "maxim,max17055";
        label = "max17055";
        reg = <0x36>;

        // TODO: Zephyr 2.6
        // design-capacity = <1200>;
        design-voltage = <3700>;
        desired-voltage = <4200>;
        desired-charging-current = <400>;
        // i-chg-term = <30>;
        rsense-mohms = <5>;
        // v-empty = <3000>;
    };
};

&usbd {
    status = "okay";
};

&flash0 {
    // For more information, see
    // https://docs.zephyrproject.org/latest/reference/storage/flash_map/flash_map.html
    partitions {
        compatible = "fixed-partitions";
        #address-cells = <1>;
        #size-cells = <1>;

        sd_partition: partition@0 {
            label = "softdevice";
            reg = <0x00000000 0x00026000>;
        };
        code_partition: partition@1000 {
            label = "code_partition";
            reg = <0x00001000 0x000d3000>;
        };

        // The flash starting at 0x000d4000 and ending at
        // 0x000f3fff is reserved for use by the application.

        // Storage partition will be used by FCB/LittleFS/NVS if enabled.
        storage_partition: partition@d4000 {
            label = "storage";
            reg = <0x000d4000 0x00020000>;
        };

        boot_partition: partition@f4000 {
            label = "adafruit_boot";
            reg = <0x000f4000 0x0000c000>;
        };
    };
};
`;

export const devicetreeFile: IFileChangeCardProps = {
    modified: {
        name: 'config/boards/arm/numble/numble.dts',
        text: newDts,
    },
};

const newKconfig = `\
# Copyright (c) 2020 The ZMK Contributors
# SPDX-License-Identifier: MIT

mainmenu "ZMK Firmware"

menu "ZMK"

menu "Basic Keyboard Setup"

config ZMK_KEYBOARD_NAME
  help
    help text ends based on indentation level
    which is really hard to highlight
  string "Keyboard Name"

config USB_DEVICE_PRODUCT
  default ZMK_KEYBOARD_NAME

config BT_DEVICE_NAME
  default ZMK_KEYBOARD_NAME

config USB_DEVICE_VID
  default 0x1D50

config USB_DEVICE_PID
  default 0x615E

config USB_DEVICE_MANUFACTURER
  default "ZMK Project"

menu "HID Output Types"

config ZMK_USB
  bool "USB"
  select USB
  select USB_DEVICE_STACK
  select USB_DEVICE_HID

if ZMK_USB

config USB_NUMOF_EP_WRITE_RETRIES
  default 10

#ZMK_USB
endif

menuconfig ZMK_BLE
  bool "BLE (HID over GATT)"
  select BT
  select BT_SMP
  select BT_SMP_SC_PAIR_ONLY
  select BT_SMP_APP_PAIRING_ACCEPT
  select BT_PERIPHERAL
  select BT_DIS
  select BT_BAS
  select BT_SETTINGS
  select SETTINGS

if ZMK_BLE

config SYSTEM_WORKQUEUE_STACK_SIZE
  default 2048

config ZMK_BLE_THREAD_STACK_SIZE
  int "BLE notify thread stack size"
  default 512

config ZMK_BLE_THREAD_PRIORITY
  int "BLE notify thread priority"
  default 5

config ZMK_BLE_KEYBOARD_REPORT_QUEUE_SIZE
  int "Max number of keyboard HID reports to queue for sending over BLE"
  default 20

config ZMK_BLE_CONSUMER_REPORT_QUEUE_SIZE
  int "Max number of consumer HID reports to queue for sending over BLE"
  default 5

config ZMK_BLE_CLEAR_BONDS_ON_START
  bool "Configuration that clears all bond information from the keyboard on startup."
  default n

# HID GATT notifications sent this way are *not* picked up by Linux, and possibly others.
config BT_GATT_NOTIFY_MULTIPLE
  default n

config BT_DEVICE_APPEARANCE
  default 961

config ZMK_BLE_PASSKEY_ENTRY
  bool "Experimental: Requiring typing passkey from host to pair BLE connection"
  default n

#ZMK_BLE
endif

#HID Output Types
endmenu

menu "Split Support"

config ZMK_SPLIT
  bool "Split keyboard support"

if ZMK_SPLIT

menuconfig ZMK_SPLIT_BLE
  bool "Split keyboard support via BLE transport"
  depends on ZMK_BLE
  default y
  select BT_USER_PHY_UPDATE

if ZMK_SPLIT_BLE

menuconfig ZMK_SPLIT_BLE_ROLE_CENTRAL
  bool "Central"
  select BT_CENTRAL
  select BT_GATT_CLIENT

if ZMK_SPLIT_BLE_ROLE_CENTRAL

config ZMK_SPLIT_BLE_CENTRAL_POSITION_QUEUE_SIZE
  int "Max number of key position state events to queue when received from peripherals"
  default 5

endif

if !ZMK_SPLIT_BLE_ROLE_CENTRAL

config ZMK_SPLIT_BLE_PERIPHERAL_STACK_SIZE
  int "BLE split peripheral notify thread stack size"
  default 512

config ZMK_SPLIT_BLE_PERIPHERAL_PRIORITY
  int "BLE split peripheral notify thread priority"
  default 5

config ZMK_SPLIT_BLE_PERIPHERAL_POSITION_QUEUE_SIZE
  int "Max number of key position state events to queue to send to the central"
  default 10

config ZMK_USB
  default n

config BT_MAX_PAIRED
  default 1

config BT_MAX_CONN
  default 1

config BT_GAP_AUTO_UPDATE_CONN_PARAMS
  default n

#!ZMK_SPLIT_BLE_ROLE_CENTRAL
endif

#ZMK_SPLIT_BLE
endif

#ZMK_SPLIT
endif

if ZMK_BLE

if ZMK_SPLIT_BLE && ZMK_SPLIT_BLE_ROLE_CENTRAL

config BT_MAX_CONN
  default 6

config BT_MAX_PAIRED
  default 6

#ZMK_SPLIT_BLE && ZMK_SPLIT_BLE_ROLE_CENTRAL
endif

if !ZMK_SPLIT_BLE

config BT_MAX_CONN
  default 5

config BT_MAX_PAIRED
  default 5

#!ZMK_SPLIT_BLE
endif

#ZMK_BLE
endif

#Split Support
endmenu

#Basic Keyboard Setup
endmenu

menu "Display/LED Options"

rsource "src/display/Kconfig"

config ZMK_RGB_UNDERGLOW
  bool "RGB Adressable LED Underglow"
  select LED_STRIP

if ZMK_RGB_UNDERGLOW

# This default value cuts down on tons of excess .conf files, if you're using GPIO, manually disable this
config SPI
  default y

config ZMK_RGB_UNDERGLOW_EXT_POWER
  bool "RGB underglow toggling also controls external power"
  default y

config ZMK_RGB_UNDERGLOW_HUE_STEP
  int "RGB underglow hue step in degrees of 360"
  default 10

config ZMK_RGB_UNDERGLOW_SAT_STEP
  int "RGB underglow sturation step in percent"
  default 10

config ZMK_RGB_UNDERGLOW_BRT_STEP
  int "RGB underglow brightness step in percent"
  default 10

config ZMK_RGB_UNDERGLOW_HUE_START
  int "RGB underglow start hue value from 0-359"
  default 0

config ZMK_RGB_UNDERGLOW_SAT_START
  int "RGB underglow start saturations value from 0-100"
  default 100

config ZMK_RGB_UNDERGLOW_BRT_START
  int "RGB underglow start brightness value from 0-100"
  default 100

config ZMK_RGB_UNDERGLOW_SPD_START
  int "RGB underglow start animation speed value from 1-5"
  default 3

config ZMK_RGB_UNDERGLOW_EFF_START
  int "RGB underglow start effect int value related to the effect enum list"
  default 0

config ZMK_RGB_UNDERGLOW_ON_START
  bool "RGB underglow starts on by default"
  default y

#ZMK_RGB_UNDERGLOW
endif

#Display/LED Options
endmenu

menu "Power Management"

config ZMK_IDLE_TIMEOUT
  int "Milliseconds of inactivity before entering idle state (OLED shutoff, etc)"
  default 30000

config ZMK_SLEEP
  bool "Enable deep sleep support"
  imply USB

if ZMK_SLEEP

config SYS_POWER_DEEP_SLEEP_STATES
  default y

choice SYS_PM_POLICY
  default SYS_PM_POLICY_APP
endchoice

config DEVICE_POWER_MANAGEMENT
  default y

config ZMK_IDLE_SLEEP_TIMEOUT
  int "Milliseconds of inactivity before entering deep sleep"
  default 900000

#ZMK_SLEEP
endif

config ZMK_EXT_POWER
  bool "Enable support to control external power output"
  default y

#Power Management
endmenu

menu "Combo options"

config ZMK_COMBO_MAX_PRESSED_COMBOS
  int "Maximum number of currently pressed combos"
  default 4

config ZMK_COMBO_MAX_COMBOS_PER_KEY
  int "Maximum number of combos per key"
  default 5

config ZMK_COMBO_MAX_KEYS_PER_COMBO
  int "Maximum number of keys per combo"
  default 4

#Display/LED Options
endmenu

menu "Advanced"

menu "Initialization Priorities"

if USB

config ZMK_USB_INIT_PRIORITY
  int "USB Init Priority"
  default 50

#USB
endif

if ZMK_BLE || ZMK_SPLIT_BLE

config ZMK_BLE_INIT_PRIORITY
  int "BLE Init Priority"
  default 50

#ZMK_BLE || ZMK_SPLIT_BLE
endif

#Initialization Priorities
endmenu

menu "KSCAN Settings"

config ZMK_KSCAN_EVENT_QUEUE_SIZE
  int "Size of the event queue for KSCAN events to buffer events"
  default 4

config ZMK_KSCAN_MOCK_DRIVER
  bool "Enable mock kscan driver to simulate key presses"

config ZMK_KSCAN_COMPOSITE_DRIVER
  bool "Enable composite kscan driver to combine kscan devices"

#KSCAN Settings
endmenu

menu "USB Logging"

config ZMK_USB_LOGGING
  bool "Enable USB CDC ACM logging to help debug"
  select LOG
  select USB
  select USB_DEVICE_STACK
  select USB_CDC_ACM
  select SERIAL
  select CONSOLE
  select UART_INTERRUPT_DRIVEN
  select UART_LINE_CTRL
  select UART_CONSOLE
  select USB_UART_CONSOLE

if ZMK_USB_LOGGING

config ZMK_LOG_LEVEL
  default 4

config USB_CDC_ACM_RINGBUF_SIZE
  default 1024

config USB_CDC_ACM_DEVICE_NAME
  default "CDC_ACM"

config USB_CDC_ACM_DEVICE_COUNT
  default 1

config UART_CONSOLE_ON_DEV_NAME
  default "CDC_ACM_0"

config LOG_BUFFER_SIZE
  default 8192

config LOG_STRDUP_BUF_COUNT
  default 16

#ZMK_USB_LOGGING
endif

#USB Logging
endmenu

if SETTINGS

config ZMK_SETTINGS_SAVE_DEBOUNCE
  int "Milliseconds to debounce settings saves"
  default 60000

#SETTINGS
endif

#Advanced
endmenu

#ZMK
endmenu

config HEAP_MEM_POOL_SIZE
  default 8192

config KERNEL_BIN_NAME
  default "zmk"

config REBOOT
  default y

config USB
  default y if HAS_HW_NRF_USBD

config ZMK_WPM
  bool "Calculate WPM"
  default n

config SENSOR
  default y

module = ZMK
module-str = zmk
source "subsys/logging/Kconfig.template.log_config"

rsource "boards/Kconfig"
rsource "boards/shields/*/Kconfig.defconfig"
rsource "boards/shields/*/Kconfig.shield"

osource "$(ZMK_CONFIG)/boards/shields/*/Kconfig.defconfig"
osource "$(ZMK_CONFIG)/boards/shields/*/Kconfig.shield"


source "Kconfig.zephyr"
`;

export const kconfigFile: IFileChangeCardProps = {
    modified: {
        name: 'app/Kconfig',
        text: newKconfig,
    },
};
