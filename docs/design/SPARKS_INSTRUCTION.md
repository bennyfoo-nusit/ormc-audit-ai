# NUS Application Design Principles Guide

> **Purpose:** This guide is consumed by GitHub Copilot and GitHub Sparks to generate prototypes that comply with NUS corporate identity, existing Figma design patterns, and Material Design 3 principles.
>
> **Last updated:** March 2026

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Component Library (MUI)](#2-component-library-mui)

---

## 1. Color System

### 1.1 NUS Primary Colour Palette

| Name | Hex | Preview | RGB | Pantone | Usage |
|------|-----|---------|-----|---------|-------|
| **NUS Orange** | `#EF7C00` | <span style="display:inline-block;width:16px;height:16px;background-color:#EF7C00;border:1px solid #ccc;border-radius:3px"></span> | R239, G124, B0 | PMS 152 | Primary accent, CTAs, highlights, active states |
| **NUS Blue** | `#003D7C` | <span style="display:inline-block;width:16px;height:16px;background-color:#003D7C;border:1px solid #ccc;border-radius:3px"></span> | R0, G61, B124 | PMS 294 | Primary brand, headers, navigation, links |


### 1.2 NUS Secondary Colour Palette

| Name | Pantone | Usage |
|------|---------|-------|
| **NUS Gold** | PMS 872 | Special events, high-profile collateral only |
| **NUS Silver** | PMS 8420 | Special events, high-profile collateral only |


### 1.3 NUS Semantic UI Colours (from nus.edu.sg)

These colours are used for specific UI regions on the live NUS site:

| Element | Colour | Hex | Preview | Usage |
|---------|--------|-----|---------|-------|
| **Body background** | White | `#FFFFFF` | <span style="display:inline-block;width:16px;height:16px;background-color:#FFFFFF;border:1px solid #ccc;border-radius:3px"></span> | Main page background |
| **Body text** | Dark grey | `#333333` | <span style="display:inline-block;width:16px;height:16px;background-color:#333333;border:1px solid #ccc;border-radius:3px"></span> | Primary body text |
| **Secondary text** | Medium grey | `#555555` | <span style="display:inline-block;width:16px;height:16px;background-color:#555555;border:1px solid #ccc;border-radius:3px"></span> | Input text, form controls |
| **Muted text** | Grey | `#999999` | <span style="display:inline-block;width:16px;height:16px;background-color:#999999;border:1px solid #ccc;border-radius:3px"></span> | Captions, helper text, footer text |
| **Link colour** | NUS Blue | `#003D7C` | <span style="display:inline-block;width:16px;height:16px;background-color:#003D7C;border:1px solid #ccc;border-radius:3px"></span> | Hyperlinks, subheadings |
| **Link hover** | Dark navy | `#001730` | <span style="display:inline-block;width:16px;height:16px;background-color:#001730;border:1px solid #ccc;border-radius:3px"></span> | Hovered links |
| **Navbar background** | Light grey | `#F8F8F8` | <span style="display:inline-block;width:16px;height:16px;background-color:#F8F8F8;border:1px solid #ccc;border-radius:3px"></span> | Navigation bar |
| **Navbar border** | Silver | `#E7E7E7` | <span style="display:inline-block;width:16px;height:16px;background-color:#E7E7E7;border:1px solid #ccc;border-radius:3px"></span> | Navbar bottom border |
| **Navbar text** | Grey | `#777777` | <span style="display:inline-block;width:16px;height:16px;background-color:#777777;border:1px solid #ccc;border-radius:3px"></span> | Navigation links (default) |
| **Navbar active text** | Dark grey | `#555555` | <span style="display:inline-block;width:16px;height:16px;background-color:#555555;border:1px solid #ccc;border-radius:3px"></span> | Active navigation links |
| **Navbar active bg** | Silver | `#E7E7E7` | <span style="display:inline-block;width:16px;height:16px;background-color:#E7E7E7;border:1px solid #ccc;border-radius:3px"></span> | Active navbar item background |
| **Card background** | White | `#FFFFFF` | <span style="display:inline-block;width:16px;height:16px;background-color:#FFFFFF;border:1px solid #ccc;border-radius:3px"></span> | Card surfaces |
| **Card title** | Dark grey | `#333333` | <span style="display:inline-block;width:16px;height:16px;background-color:#333333;border:1px solid #ccc;border-radius:3px"></span> | Card title text |
| **Card subheading** | NUS Blue | `#003D7C` | <span style="display:inline-block;width:16px;height:16px;background-color:#003D7C;border:1px solid #ccc;border-radius:3px"></span> | Card sub-heading text |
| **Card hover bg** | Light grey | `#EEEEEE` | <span style="display:inline-block;width:16px;height:16px;background-color:#EEEEEE;border:1px solid #ccc;border-radius:3px"></span> | Card/list item hover state |
| **Section alt bg** | Off-white | `#F6F6F6` | <span style="display:inline-block;width:16px;height:16px;background-color:#F6F6F6;border:1px solid #ccc;border-radius:3px"></span> | Alternating section backgrounds |
| **Section alt bg 2** | Off-white | `#F3F3F3` | <span style="display:inline-block;width:16px;height:16px;background-color:#F3F3F3;border:1px solid #ccc;border-radius:3px"></span> | Secondary alternating sections |
| **Breadcrumb bar** | Dark navy | `#002449` | <span style="display:inline-block;width:16px;height:16px;background-color:#002449;border:1px solid #ccc;border-radius:3px"></span> | Breadcrumb navigation strip |
| **Footer background** | Dark blue | `#003062` | <span style="display:inline-block;width:16px;height:16px;background-color:#003062;border:1px solid #ccc;border-radius:3px"></span> | Page footer |
| **Footer text** | Grey | `#999999` | <span style="display:inline-block;width:16px;height:16px;background-color:#999999;border:1px solid #ccc;border-radius:3px"></span> | Footer body text |
| **Footer link** | Grey | `#999999` | <span style="display:inline-block;width:16px;height:16px;background-color:#999999;border:1px solid #ccc;border-radius:3px"></span> | Footer links (default) |
| **Footer link hover** | White | `#FFFFFF` | <span style="display:inline-block;width:16px;height:16px;background-color:#FFFFFF;border:1px solid #ccc;border-radius:3px"></span> | Footer links (hovered) |
| **Sidebar hover** | Light grey | `#EEEEEE` | <span style="display:inline-block;width:16px;height:16px;background-color:#EEEEEE;border:1px solid #ccc;border-radius:3px"></span> | Sidebar item hover |
| **Orange accent** | NUS Orange | `#EF7C00` | <span style="display:inline-block;width:16px;height:16px;background-color:#EF7C00;border:1px solid #ccc;border-radius:3px"></span> | Hover accents, active items |
| **Submit button bg** | Mid blue | `#366BA4` | <span style="display:inline-block;width:16px;height:16px;background-color:#366BA4;border:1px solid #ccc;border-radius:3px"></span> | Form submit buttons |
| **Accent link blue** | Mid blue | `#1A5796` | <span style="display:inline-block;width:16px;height:16px;background-color:#1A5796;border:1px solid #ccc;border-radius:3px"></span> | Tonal blue for secondary links |

### 1.4 Dark Theme

Apply M3 dark theme by inverting tonal values. NUS Blue and NUS Orange remain recognizable but tonally adjusted:

| M3 Dark Role | Value | Preview |
|-------------|-------|------|
| `--md-sys-color-primary` | `#A8C8E8` (lightened NUS Blue) | <span style="display:inline-block;width:16px;height:16px;background-color:#A8C8E8;border:1px solid #ccc;border-radius:3px"></span> |
| `--md-sys-color-secondary` | `#FFB870` (lightened NUS Orange) | <span style="display:inline-block;width:16px;height:16px;background-color:#FFB870;border:1px solid #ccc;border-radius:3px"></span> |
| `--md-sys-color-surface` | `#1C1B1F` | <span style="display:inline-block;width:16px;height:16px;background-color:#1C1B1F;border:1px solid #ccc;border-radius:3px"></span> |
| `--md-sys-color-on-surface` | `#E6E1E5` | <span style="display:inline-block;width:16px;height:16px;background-color:#E6E1E5;border:1px solid #ccc;border-radius:3px"></span> |
| `--md-sys-color-background` | `#1C1B1F` | <span style="display:inline-block;width:16px;height:16px;background-color:#1C1B1F;border:1px solid #ccc;border-radius:3px"></span> |

### 1.5 Colour Usage Rules

- **DO:** Use NUS Blue for primary navigation and header bars
- **DO:** Use NUS Orange for primary call-to-action buttons
- **DO:** Ensure sufficient contrast between logo and background (WCAG AA minimum)
- **DON'T:** Use patterned backgrounds behind the NUS logo
- **DON'T:** Change the logo colours to non-approved variants
- **DON'T:** Use NUS Gold/Silver for UI elements — these are for special print collateral only

---

## 2. Component Library (MUI)

Use **Material UI (MUI)** as the default component library for all prototypes. Reference: <https://mui.com/material-ui/all-components/>

Always prefer MUI components over custom implementations. Import from `@mui/material`.

### 2.1 Preferred Components by Category

#### Inputs
| Component | Import | When to Use |
|-----------|--------|-------------|
| Button | `@mui/material/Button` | Primary actions, CTAs, form submissions |
| TextField | `@mui/material/TextField` | Text input, search, form fields |
| Select | `@mui/material/Select` | Dropdown selections |
| Checkbox | `@mui/material/Checkbox` | Multi-option toggles |
| Radio Group | `@mui/material/RadioGroup` | Single-option selections |
| Switch | `@mui/material/Switch` | On/off toggles |
| Autocomplete | `@mui/material/Autocomplete` | Search with suggestions |
| Slider | `@mui/material/Slider` | Range selections |
| Rating | `@mui/material/Rating` | Star/score ratings |
| Toggle Button | `@mui/material/ToggleButton` | Grouped option toggles |
| Floating Action Button | `@mui/material/Fab` | Primary floating actions |

#### Data Display
| Component | Import | When to Use |
|-----------|--------|-------------|
| Typography | `@mui/material/Typography` | All text rendering |
| Table | `@mui/material/Table` | Tabular data |
| List | `@mui/material/List` | Vertical item lists |
| Avatar | `@mui/material/Avatar` | User profile images |
| Badge | `@mui/material/Badge` | Notification counts |
| Chip | `@mui/material/Chip` | Tags, filters, compact elements |
| Tooltip | `@mui/material/Tooltip` | Hover help text |
| Divider | `@mui/material/Divider` | Visual separators |
| Icon | `@mui/icons-material` | Material icons |

#### Feedback
| Component | Import | When to Use |
|-----------|--------|-------------|
| Alert | `@mui/material/Alert` | Status messages, notifications |
| Dialog | `@mui/material/Dialog` | Modal confirmations, forms |
| Snackbar | `@mui/material/Snackbar` | Temporary notifications |
| Progress | `@mui/material/CircularProgress` | Loading indicators |
| Skeleton | `@mui/material/Skeleton` | Content placeholders while loading |
| Backdrop | `@mui/material/Backdrop` | Overlay behind modals |

#### Surfaces
| Component | Import | When to Use |
|-----------|--------|-------------|
| Card | `@mui/material/Card` | Content containers |
| Paper | `@mui/material/Paper` | Elevated surfaces |
| Accordion | `@mui/material/Accordion` | Expandable content sections |
| App Bar | `@mui/material/AppBar` | Top navigation bar |

#### Navigation
| Component | Import | When to Use |
|-----------|--------|-------------|
| Tabs | `@mui/material/Tabs` | Tabbed content switching |
| Drawer | `@mui/material/Drawer` | Side navigation panel |
| Breadcrumbs | `@mui/material/Breadcrumbs` | Page hierarchy navigation |
| Menu | `@mui/material/Menu` | Dropdown menus |
| Pagination | `@mui/material/Pagination` | Page navigation |
| Bottom Navigation | `@mui/material/BottomNavigation` | Mobile bottom nav |
| Stepper | `@mui/material/Stepper` | Multi-step workflows |
| Link | `@mui/material/Link` | Styled hyperlinks |
| Speed Dial | `@mui/material/SpeedDial` | Floating action menu |

#### Layout
| Component | Import | When to Use |
|-----------|--------|-------------|
| Box | `@mui/material/Box` | Generic container, flexbox wrapper |
| Container | `@mui/material/Container` | Centered max-width wrapper |
| Grid | `@mui/material/Grid` | Responsive grid layout |
| Stack | `@mui/material/Stack` | Vertical/horizontal flex layout |
| Image List | `@mui/material/ImageList` | Image grid/gallery |

#### Utils
| Component | Import | When to Use |
|-----------|--------|-------------|
| CssBaseline | `@mui/material/CssBaseline` | Global CSS reset (always include) |
| Modal | `@mui/material/Modal` | Low-level modal wrapper |
| Popover | `@mui/material/Popover` | Anchored overlay content |

### 2.2 NUS Theme Customization

Always wrap the application with a custom MUI theme that maps NUS colours from Section 1. Apply this theme at the root of every prototype:

```tsx
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';

const nusTheme = createTheme({
  palette: {
    primary: {
      main: '#003D7C',       // NUS Blue
      dark: '#002449',       // Breadcrumb bar / darker blue
      light: '#366BA4',      // Submit button blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#EF7C00',       // NUS Orange
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',    // Body background
      paper: '#FFFFFF',      // Card background
    },
    text: {
      primary: '#333333',    // Body text
      secondary: '#555555',  // Input text, form controls
      disabled: '#999999',   // Muted text, captions
    },
    divider: '#E7E7E7',     // Borders, navbar border
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#EF7C00',      // Reuse NUS Orange for warnings
    },
    info: {
      main: '#1A5796',      // Accent link blue
    },
    success: {
      main: '#2E7D32',
    },
    action: {
      hover: '#EEEEEE',     // Card hover bg
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", "Helvetica", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#003D7C',  // NUS Blue header
          color: '#FFFFFF',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          backgroundColor: '#003D7C',
          '&:hover': { backgroundColor: '#002449' },
        },
        containedSecondary: {
          backgroundColor: '#EF7C00',
          '&:hover': { backgroundColor: '#D06D00' },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#003D7C',
          '&:hover': { color: '#001730' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#EEEEEE' },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFFFF',
          color: '#333333',
        },
      },
    },
  },
});

// Wrap every prototype with this:
function App() {
  return (
    <ThemeProvider theme={nusTheme}>
      <CssBaseline />
      {/* App content */}
    </ThemeProvider>
  );
}
```

### 2.3 NUS Footer Component Pattern

Use this pattern for the standard NUS footer:

```tsx
<Box sx={{ bgcolor: '#003062', color: '#999999', py: 4 }}>
  <Container>
    <Typography variant="body2" sx={{ color: '#999999' }}>
      © National University of Singapore
    </Typography>
    <Link sx={{ color: '#999999', '&:hover': { color: '#FFFFFF' } }}>
      Privacy Policy
    </Link>
  </Container>
</Box>
```

### 2.4 NUS Breadcrumb Bar Pattern

```tsx
<Box sx={{ bgcolor: '#002449', py: 1, px: 2 }}>
  <Breadcrumbs sx={{ color: '#FFFFFF', '& .MuiBreadcrumbs-separator': { color: '#FFFFFF' } }}>
    <Link sx={{ color: '#FFFFFF' }}>Home</Link>
    <Typography sx={{ color: '#FFFFFF' }}>Current Page</Typography>
  </Breadcrumbs>
</Box>
```

### 2.5 Component Usage Rules

- **DO:** Always use `<ThemeProvider>` with the NUS theme at the app root
- **DO:** Always include `<CssBaseline />` for consistent baseline styles
- **DO:** Use `variant="contained"` for primary action buttons
- **DO:** Use MUI `<Typography>` for all text — never use raw `<p>`, `<h1>`, etc.
- **DO:** Use MUI `<Grid>` or `<Stack>` for layout — never use raw CSS grid/flexbox unless necessary
- **DON'T:** Override theme colours inline when the theme already provides the correct colour
- **DON'T:** Create custom components when an MUI component exists for the same purpose
- **DON'T:** Use `@mui/material/styles` legacy API — use `@mui/material` direct imports