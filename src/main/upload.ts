import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { convertToAsar } from 'mbtiles-to-asar';
import archiver from 'archiver';

const handleUploadFile = async (
  // eslint-disable-next-line no-undef
  event: Electron.IpcMainEvent,
  filePath: string,
) => {
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

    const output = fs.createWriteStream(zipFilePath);
    process.noAsar = true;
    const archive = archiver('zip', {
      zlib: { level: 9 },
      store: true, // Do not compress files, store them uncompressed
    });
    output.on('close', () => {
      console.log(`Zip file created: ${zipFilePath}`);
    });

    archive.on('error', (err: Error) => {
      throw err;
    });
    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        // log warning
      } else {
        // throw error
        throw err;
      }
    });

    archive.pipe(output);
    archive.directory(outputDir, 'default');
    archive.finalize();
    // Provide the URL for the front-end to download the zip file

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
