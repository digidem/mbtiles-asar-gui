import { ipcMain, IpcMainEvent } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { exec } from 'child_process';
import { convertToAsar } from 'mbtiles-to-asar';

const handleUploadFile = async (event: IpcMainEvent, filePath: string) => {
  console.log('upload-file received from renderer process', filePath);
  if (!filePath) {
    console.log('No file path received.');
    return { canceled: true, error: { message: 'No file path received.' } };
  }
  event.reply('upload-file-response', { uploaded: true });
  try {
    // Create a unique hash for the temporary folder
    const hash = crypto
      .createHash('sha256')
      .update(filePath + Date.now().toString())
      .digest('hex');
    const tempDir = path.join(os.tmpdir(), 'mbtiles-to-asar', hash);
    const outputDir = path.join(tempDir, 'default');
    console.log(
      `Directories and file paths set: tempDir=${tempDir}, outputDir=${outputDir}`,
    );

    // Convert the file to ASAR and place it in the tiles directory
    await convertToAsar(filePath, outputDir);
    console.log(`File converted to ASAR: ${filePath}`);

    // Create a zip file of the output directory
    const zipFilePath = path.join(tempDir, `mapeo-asar-background-map.zip`);

    if (fs.existsSync(outputDir)) {
      console.log('Output directory found at path:', outputDir);
      const isWindows = os.platform() === 'win32';
      const command = isWindows
        ? `powershell Compress-Archive -Path ${path.join(outputDir, '*')} -DestinationPath ${zipFilePath}`
        : `cd ${path.dirname(outputDir)} && zip -r ${zipFilePath} ${path.basename(outputDir)}`;
      await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error creating zip file: ${stderr}`);
            reject(error);
          } else {
            console.log(`Zip file created: ${zipFilePath}`);
            resolve(stdout);
          }
        });
      });
    } else {
      throw new Error(`Output directory not found at path: ${outputDir}`);
    }
    const downloadUrl = `file://${zipFilePath}`;
    // Get OS information and default application folder
    const osType = os.type();
    const homeDir = os.homedir();

    return {
      canceled: false,
      filePath,
      outputDir,
      downloadUrl,
      osType,
      homeDir,
    };
  } catch (error) {
    console.error('Error during conversion:', error);
    return {
      canceled: true,
      error: (error as Error).message,
    };
  }
};

ipcMain.on('upload-file', async (event, filePath) => {
  const result = await handleUploadFile(event, filePath);
  event.reply('upload-file-response', result);
});

export default handleUploadFile;
