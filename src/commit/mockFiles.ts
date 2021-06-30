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
