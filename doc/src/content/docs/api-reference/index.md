---
title: API Reference
description: Complete API reference for VistaView
---

Complete reference for all VistaView types, interfaces, and functions.

## Overview

The VistaView API is organized into the following sections:

### [VistaView Class](/api-reference/vistaview)

The core [VistaView](/api-reference/vistaview) controller class that manages the lightbox lifecycle.

- Public properties and methods
- Instance management
- Navigation and controls

### [VistaState Class](/api-reference/vistastate)

Internal [VistaState](/api-reference/vistastate) state management class.

- Current index and status
- Zoom and transition state
- Extension registry

### [VistaBox Class](/api-reference/vistabox)

Abstract base class for content containers.

- Sizing and transformations
- Lifecycle hooks
- Extensibility for custom content

### [VistaImage Class](/api-reference/vistaimage)

Image implementation extending VistaBox.

- Progressive image loading
- Responsive images support
- Zoom and pan controls

### [VistaPointers Class](/api-reference/vistapointers)

Multi-pointer tracking system.

- Mouse, touch, and pen input
- Multi-touch gestures
- Pointer distance and centroid calculations

### [VistaImageEvent Class](/api-reference/vistaimageevent)

Event handling for pointer interactions.

- Gesture recognition
- Zoom and pan coordination
- External listener registration

### [VistaHiresTransition Class](/api-reference/vistaHiresTransition)

High-resolution image transition manager.

- Smooth animation easing
- State interpolation
- Concurrent animation handling

### [Main Function](/api-reference/main-function)

The `vistaView()` function, configuration types, and instance methods.

- `vistaView()` function
- `VistaParamsNeo` configuration type
- `VistaInterface` return type with control methods
- `VistaImgConfig` type

### [Event Callbacks](/api-reference/events)

Event callback functions and their data types.

- `onOpen` - Triggered when lightbox opens
- `onClose` - Triggered when lightbox closes
- `onImageView` - Triggered when navigating between images
- `onContentChange` - Triggered when content changes
- `VistaData` type

### [Lifecycle Functions](/api-reference/lifecycle)

Custom lifecycle function types for overriding default behavior.

- `initFunction` - Custom initialization
- `imageSetupFunction` - Custom image setup
- `transitionFunction` - Custom transitions
- `closeFunction` - Custom close behavior
- Default behavior functions

### [Extensions](/api-reference/extensions)

Extension system types and interfaces.

- `VistaExtension` interface
- Extension hooks and callbacks
- Control types
- Advanced classes

## Quick Links

- [Configuration Guide](/core/configuration/complete)
- [Events Guide](/core/configuration/events)
- [Lifecycle Guide](/core/configuration/lifecycle)
- [Extensions Authoring](/extensions/authoring)

## TypeScript Usage

Import types separately from values:

```typescript
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaParamsNeo, VistaData } from 'vistaview';
```
