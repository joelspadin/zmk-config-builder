import { IFileChangeCardProps } from './FileChangeCard';

const newConfigFile = `\
# Uncomment the following lines to enable the Corne RGB Underglow
# CONFIG_ZMK_RGB_UNDERGLOW=y
# CONFIG_WS2812_STRIP=y

# Uncomment the following line to enable the Corne OLED Display
# CONFIG_ZMK_DISPLAY=y
`;

export const addConfigFile: IFileChangeCardProps = {
    modified: {
        name: 'config/corne.conf',
        text: newConfigFile,
    },
};

export const deleteConfigFile: IFileChangeCardProps = {
    original: {
        name: 'config/corne.conf',
        text: newConfigFile,
    },
};

export const renameConfigFile: IFileChangeCardProps = {
    original: {
        name: 'corne.conf',
        text: newConfigFile,
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
