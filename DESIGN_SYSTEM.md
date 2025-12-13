# 🎨 PM TOOL - FRONTEND UI DESIGN GUIDE

## Visual Layout Guide

### 📱 Login Page Layout
```
┌─────────────────────────────────────┐
│  Gradient Background                │
│  (#667eea → #764ba2)               │
│                                     │
│      ┌─────────────────────────┐   │
│      │    Company Login        │   │
│      │                         │   │
│      │  ┌─────────────────┐   │   │
│      │  │ Email Address   │   │   │
│      │  │ [input field]   │   │   │
│      │  └─────────────────┘   │   │
│      │                         │   │
│      │  ┌─────────────────┐   │   │
│      │  │ Password        │   │   │
│      │  │ [input field]   │   │   │
│      │  └─────────────────┘   │   │
│      │                         │   │
│      │  ┌─────────────────┐   │   │
│      │  │ [Login Button]  │   │   │
│      │  └─────────────────┘   │   │
│      │                         │   │
│      │ Register here »         │   │
│      └─────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 📋 Register Page Layout
```
┌──────────────────────────────────────┐
│  Gradient Background                 │
│                                      │
│      ┌──────────────────────────┐   │
│      │ Register Your Company    │   │
│      │                          │   │
│      │ Company Name             │   │
│      │ [━━━━━━━━━━━━━━━━━━━]   │   │
│      │                          │   │
│      │ Admin Email              │   │
│      │ [━━━━━━━━━━━━━━━━━━━]   │   │
│      │                          │   │
│      │ Password                 │   │
│      │ [━━━━━━━━━━━━━━━━━━━]   │   │
│      │                          │   │
│      │ ┌──────────┬──────────┐  │   │
│      │ │ Phone    │ Website  │  │   │
│      │ │ [━━━━]   │ [━━━━]   │  │   │
│      │ └──────────┴──────────┘  │   │
│      │                          │   │
│      │ Description              │   │
│      │ [━━━━━━━━━━━━━━━━━━━]   │   │
│      │                          │   │
│      │ [Register Company]       │   │
│      │ Already have account »   │   │
│      └──────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘
```

### 📊 Dashboard Layout
```
┌────────────────────────────────────────────────────────────┐
│ [Logo] PM Tool          Welcome, Acme Corp    [Logout]     │
├──────────────┬──────────────────────────────────────────────┤
│ 🏠 Dashboard │  Dashboard                                   │
│ 👥 Employees │  ┌─────────────────────────────────────────┐ │
│ 📁 Projects  │  │ Stats: 👥 0  📁 0  ✓ 0  👔 0             │ │
│ ✓ Tasks      │  └─────────────────────────────────────────┘ │
│ ⚙️ Settings  │                                              │
│              │  ┌──────────────────┐  ┌──────────────────┐ │
│              │  │ Quick Actions    │  │ Recent Activity  │ │
│              │  │ + Add Employee   │  │ No activity yet  │ │
│              │  │ + New Project    │  │                  │ │
│              │  │ + Create Task    │  │                  │ │
│              │  │ + Invite Manager │  │                  │ │
│              │  └──────────────────┘  └──────────────────┘ │
└──────────────┴──────────────────────────────────────────────┘
```

---

## 🎨 Color Palette

### Primary Colors
```
Primary Blue:    #667eea  ■ (Main actions)
Primary Purple:  #764ba2  ■ (Hover, accents)
Text Dark:       #333333  ■ (Headers, main text)
Text Medium:     #666666  ■ (Secondary text)
Text Light:      #999999  ■ (Tertiary text)
```

### Status Colors
```
Success Green:   #388e3c  ■ (Success messages)
Error Red:       #d32f2f  ■ (Error messages)
Warning Orange:  #f57c00  ■ (Warnings)
Info Blue:       #1976d2  ■ (Info messages)
```

### Background Colors
```
Page Background: #f5f7fa  ■ (Main page bg)
Card White:      #ffffff  ■ (Cards, forms)
Input BG:        #fafafa  ■ (Input fields)
Border Gray:     #e0e0e0  ■ (Borders)
Error Light:     #ffebee  ■ (Error field bg)
```

---

## 🔤 Typography Scale

### Headings
```
H1: 28px | Weight: 700 | Letter Spacing: normal
   "Register Your Company"
   "Company Login"
   "Dashboard"

H2: 18px | Weight: 600 | Letter Spacing: normal
   "Quick Actions"
   "Recent Activity"

H3: 14px | Weight: 600 | Letter Spacing: normal
   "Stats heading"
   "Menu items"
```

### Body Text
```
Regular: 14px | Weight: 400 | Line Height: 1.5
  Body paragraphs, regular text

Labels: 13px | Weight: 600 | Letter Spacing: 0.5px
  Form labels, small headings

Small: 13px | Weight: 400 | Color: #666
  Helper text, descriptions

Tiny: 12px | Weight: 400 | Color: #999
  Captions, hints
```

---

## 📏 Spacing System

### 4px Grid System
```
xs: 4px   (0.25rem)
sm: 8px   (0.5rem)
md: 12px  (0.75rem)
lg: 16px  (1rem)
xl: 24px  (1.5rem)
2xl: 32px (2rem)
3xl: 40px (2.5rem)
```

### Applied Spacing
```
Form Input Padding:     12px (md)
Form Group Gap:         18px (md + sm)
Card Padding:           24px (xl)
Page Padding:           32px (2xl)
Section Gap:            24px (xl)
Component Gap:          12px (md)
Border Radius Small:    6px
Border Radius Medium:   8px
Border Radius Large:    12px
```

---

## 🖱️ Interactive Elements

### Buttons
```
Regular Button:
  Padding: 12px 20px
  Font: 15px, 600 weight
  Border Radius: 8px
  Transition: 0.3s ease
  
States:
  Normal:    #667eea (gradient)
  Hover:     Scale up + Shadow
  Active:    Scale down
  Disabled:  0.6 opacity
  Loading:   Spinner animation

Button Sizes:
  Large:     14px padding
  Medium:    12px padding (default)
  Small:     10px padding
```

### Form Inputs
```
Default State:
  Border: 1.5px solid #ddd
  Background: #fafafa
  Padding: 12px 14px
  Border Radius: 8px
  
Focus State:
  Border: 1.5px solid #667eea
  Background: #ffffff
  Box Shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
  
Error State:
  Border: 1.5px solid #d32f2f
  Background: #ffebee
  
Success State:
  Border: 1.5px solid #388e3c
  Background: #f1f8e9
```

### Links
```
Default:   #667eea, no underline
Hover:     #764ba2, underline
Active:    #764ba2, underline
```

---

## 🎬 Animations

### Page Load
```css
Slide Up Animation:
  From: opacity 0, transform translateY(30px)
  To:   opacity 1, transform translateY(0)
  Duration: 0.5s
  Easing: ease-out
```

### Button Hover
```css
Transform:  translateY(-2px)
Box Shadow: 0 10px 20px rgba(102, 126, 234, 0.3)
Duration:   0.3s ease
```

### Loading State
```css
Spinner Rotation:
  Duration: 0.8s
  Easing: linear
  Repeat: infinite
  
Size: 12px
Border: 2px
Color: rgba(255, 255, 255, 0.3)
Top Color: white
```

### Focus State
```css
Box Shadow: 0 0 0 3px rgba(102, 126, 234, 0.1)
Transition: 0.3s ease
```

---

## 📱 Responsive Design

### Desktop (1024px+)
```
─────────────────────────────────────
│ SIDEBAR │ MAIN CONTENT            │
│ 250px   │ Flex: 1                 │
│         │                         │
│         │ Content width: auto     │
└─────────────────────────────────────
```

### Tablet (768px - 1023px)
```
─────────────────────────────
│ MAIN CONTENT              │
│ Width: 100%               │
│ Sidebar hidden/collapsed  │
│ Grid: 2 columns           │
└─────────────────────────────
```

### Mobile (<768px)
```
──────────────────
│ MAIN CONTENT  │
│ 100% width    │
│ 1 column      │
│ Full height   │
└──────────────────
```

---

## 🎯 Component Examples

### Error Message Box
```
┌─────────────────────────────────────────┐
│ ⚠  Invalid email or password            │
│                                         │
│ Background: #ffebee (light red)         │
│ Border: 1px solid #fcc                  │
│ Text: #c33 (dark red)                   │
│ Padding: 12px 16px                      │
│ Border Radius: 6px                      │
└─────────────────────────────────────────┘
```

### Success Message Box
```
┌─────────────────────────────────────────┐
│ ✓  Company registered successfully!     │
│                                         │
│ Background: #f1f8e9 (light green)       │
│ Border: 1px solid #cfc                  │
│ Text: #3c3 (dark green)                 │
│ Padding: 12px 16px                      │
│ Border Radius: 6px                      │
└─────────────────────────────────────────┘
```

### Stat Card
```
┌──────────────────────┐
│ 👥        12         │
│            Employees │
│                      │
│ Background: white    │
│ Border Radius: 12px  │
│ Padding: 20px        │
│ Shadow: subtle       │
│ Hover: lift + shadow │
└──────────────────────┘
```

---

## 🖼️ Visual Hierarchy

### Screen Priority
```
1. Page Title (H1, largest)
   "Dashboard", "Login", "Register"

2. Section Headers (H2)
   "Quick Actions", "Recent Activity"

3. Form Labels (Small, bold)
   "Email Address", "Password"

4. Body Text (Regular)
   Descriptions, helper text

5. Hints (Smallest, gray)
   Placeholders, captions
```

---

## ✨ Special Effects

### Gradient Background
```css
background: linear-gradient(
  135deg,
  #667eea 0%,
  #764ba2 100%
);
```

### Card Shadow
```css
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
```

### Focus Glow
```css
box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
```

### Hover Lift
```css
transform: translateY(-4px);
box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
```

---

## 🎨 Design Tokens Summary

| Token | Value | Usage |
|-------|-------|-------|
| Primary Color | #667eea | Buttons, links |
| Secondary Color | #764ba2 | Hover, accents |
| Background | #f5f7fa | Page background |
| Card BG | #ffffff | Cards, forms |
| Text Primary | #333333 | Main text |
| Text Secondary | #666666 | Secondary text |
| Border | #e0e0e0 | Borders |
| Success | #388e3c | Success messages |
| Error | #d32f2f | Error messages |

---

## 📋 Checklist for Implementation

- ✅ Gradient backgrounds applied
- ✅ Color scheme consistent
- ✅ Typography standardized
- ✅ Spacing uniform
- ✅ Animations smooth
- ✅ Responsive design
- ✅ Error states styled
- ✅ Loading states shown
- ✅ Hover effects working
- ✅ Focus states visible

---

**PM Tool Design System v1.0** | November 26, 2025
Perfect for development and future enhancements!
