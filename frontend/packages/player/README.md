# @signal-app/player

The `@signal-app/player` package provides comprehensive control over the playback and stopping of MIDI events, with sound output functionality powered by [wavelet](https://github.com/ryohey/wavelet). This package is designed to handle precise scheduling and playback of MIDI events, making it ideal for applications that require accurate timing and sound synthesis.

## Introduction

The `@signal-app/player` package is designed to manage MIDI event playback and control sound output using the `wavelet` synthesizer. It includes two main classes:

- **EventScheduler**: Handles the scheduling of MIDI events with lookahead functionality to ensure accurate timing.
- **Player**: Manages playback state, controls MIDI events, and outputs sound through the `wavelet` synthesizer.

## Overview

### EventScheduler

The `EventScheduler` class is responsible for reading and scheduling chronological events. It uses a lookahead mechanism to ensure events are scheduled accurately, even during high-load scenarios.

#### Key Responsibilities

- Reading events within a specified tick range.
- Converting time in milliseconds to MIDI ticks based on the tempo.
- Managing the current scheduling position and seeking to specific ticks.

### Player

The `Player` class is responsible for controlling the playback and stopping of MIDI events. It outputs sound using the `wavelet` synthesizer and manages various playback states.

#### Key Responsibilities

- Starting and stopping playback.
- Managing loop settings.
- Ensuring precise event scheduling and sound output.
- Muting and controlling individual tracks.

## Key Features

- **Accurate Scheduling**: Ensures precise timing of MIDI events using the `EventScheduler`.
- **Comprehensive Playback Control**: Start, stop, and manage playback with the `Player` class.
- **Sound Output**: Utilizes the `wavelet` synthesizer for high-quality sound output.
- **Loop Support**: Supports looping sections of MIDI events.
- **Track Muting**: Allows for individual track muting to control playback of specific MIDI tracks.

## Getting Started

1. **Setup**: Initialize the `EventScheduler` and `Player` with the necessary configurations and dependencies.
2. **Playback Control**: Use the `Player` class to manage playback, including starting, stopping, and seeking within MIDI events.
3. **Event Handling**: Implement custom logic for handling MIDI events as needed for your application.

For detailed examples and API documentation, refer to the source code and inline comments within the package.
