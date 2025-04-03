Device Simulator
This project is a web-based simulator for controlling smart devices (Coffee Machine, Lamp, and Media Player) using WebSocket communication. It demonstrates a client-side implementation that interacts with a server to register devices, receive commands, and send status updates.

Features
Coffee Machine: Simulate brewing various coffee types (e.g., Espresso, Latte) with animations and sound effects.
Lamp: Toggle a virtual lamp on and off with visual feedback.
Media Player: Play, pause, and control the volume of an audio track with a progress bar.
WebSocket Integration: Connects to a WebSocket server to register devices and handle on/off commands.

Prerequisites
A server.
A modern web browser (e.g., Chrome, Firefox).
A WebSocket server (e.g., running on ws://localhost:8080). See for a sample server.

Usage
1. Run a WebSocket Server:
    Use an existing server or run the sample server provided in .
2. Open the Simulator:
    Open index.html in a web browser (e.g., file:///path/to/device-simulator/index.html).
3. Interact with Devices:
    Coffee Machine: Toggle the power switch and select a coffee type to brew.
    Lamp: Click "Turn On/Off" to toggle the lamp.
    Media Player: Click the play/pause button to control audio playback.