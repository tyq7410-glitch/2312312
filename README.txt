AURORA SKIN STUDIO — BUILD WINDOWS .EXE THROUGH GITHUB

This project is a desktop catalog/loadout visualizer. It does NOT modify CS2,
Steam inventory, game memory, or make skins appear in matches.

HOW TO GET THE WINDOWS INSTALLER WITHOUT INSTALLING NODE.JS:

1. On GitHub, create a new repository. You can name it aurora-skin-studio.
2. Open the new repository and choose "Add file" -> "Upload files".
3. Extract this ZIP on your computer, then upload the CONTENTS of the
   AURORA_DESKTOP folder, including the hidden .github folder.
   The .github/workflows/build-windows.yml file is required.
4. Commit the uploaded files to the main branch.
5. Open the repository's "Actions" tab.
6. Open "Build AURORA for Windows" and wait for the run to finish.
7. At the bottom of the completed run, find "Artifacts".
8. Download "AURORA-Windows-Installer", unzip it, then run the .exe.

IMPORTANT:
- You do not need Node.js on your own PC; GitHub builds the installer.
- The first build may take several minutes.
- Keep the .github folder and its workflow file in the repository.
- This is a visual skin catalog and loadout planner, not a real in-game skin changer.
