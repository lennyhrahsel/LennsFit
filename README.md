# LennsFit - Windows 10 & 11 (64-bit) Standalone Portable Software

**LennsFit** is a standalone, portable desktop health log software application for **Windows 10 (64-bit)** and **Windows 11**. It requires **0 installation, 0 administrative setup, and zero drivers**. You simply double-click and run!

---

## ⚡ Standalone & Portable Execution Options

LennsFit gives you two zero-installation options on Windows 10/11 64-bit:

### Option 1: `LennsFit-Portable-1.0.0.exe` (Single Portable Executable)
- **Zero Installation**: A single standalone `.exe` file.
- **Double-Click & Run**: Put it on a USB drive, desktop, or anywhere on your PC and double-click to run immediately without any setup wizard.
- **Offline Local Storage**: All your vitals logs stay private and encrypted on your local computer.

### Option 2: `Run-LennsFit.bat` (Instant Windows App Launcher)
- **Zero Installation**: Runs LennsFit directly in native Windows App Mode using built-in Microsoft Edge.
- **Lightweight**: No heavy dependencies required. Just extract the folder and double-click `Run-LennsFit.bat`.

---

## 🚀 How to Export Code to GitHub & Download the Portable `.exe`

### Step 1: Export Code from AI Studio to GitHub
1. Click **Settings / Code Export** in AI Studio.
2. Select **Export to GitHub** or download the **ZIP archive**.
3. Push the code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of LennsFit v1.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/LennsFit.git
   git push -u origin main
   ```

---

### Step 2: Automatic GitHub Build of Standalone Portable `.exe`
This repository includes a pre-configured GitHub Actions workflow (`.github/workflows/build-exe.yml`).

1. Pushing to `main` or pushing a version tag (e.g., `v1.0.0`) automatically builds `LennsFit-Portable-1.0.0.exe`.
2. Download the standalone executable directly under GitHub **Actions** or **Releases**.

To publish a official GitHub Release with `LennsFit-Portable-1.0.0.exe`:
```bash
git tag v1.0.0
git push origin v1.0.0
```

---

### Step 3: Local Building of Portable `.exe` on Windows
To build `LennsFit-Portable-1.0.0.exe` manually on a Windows PC:

1. Open Command Prompt in the `LennsFit` project directory.
2. Run:
   ```bash
   npm install
   npm run build:portable
   ```
3. Your portable executable will be generated in:
   - `release/LennsFit-Portable-1.0.0.exe`

---

## ✨ Core Features
- **Vitals Logging**: Log Date, Time, Blood Sugar (mg/dL or mmol/L + fasting state), Blood Pressure (Systolic & Diastolic mmHg + clinical classification), Weight (kg/lbs), and Doctor Notes.
- **Excel Spreadsheet Import**: Upload existing `.xlsx`, `.xls`, or `.csv` files with smart header detection.
- **Excel & PDF Export**: Download formatted Excel files or printable physician reports with custom header info.
- **Visual Analytics**: Interactive trend graphs for glucose control, hypertension monitoring, and weight tracking.
- **Local Data Security**: All records are saved locally on your Windows storage.
