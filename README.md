# FileCopyJob
Copies source file to destination directory and archives it with a date as a name.

Supported runtime is Node.js v8.12.0 and above.

## Usage
```bash
npm install
```
Then pass source and destination arguments respectively.

### macOS and Linux

```bash
node index /Users/garenyondem/desktop/preciousFile.txt /Users/BackupFolder
```
### Windows
```bash
node index "C:\Users\%username%\Desktop\preciousFile.txt" "E:\BackupFolder"
```