import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function SingleFileUploadForm() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [results, setResults] = useState<string | null>(null);
  const [failed, setFailed] = useState<boolean>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [tab, setTab] = useState('desktop');
  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const filePath = file.path; // This assumes you're handling a file input element
    window.electron.ipcRenderer.sendMessage('upload-file', filePath);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];
      /** File validation */
      if (window.innerWidth > 768) {
        if (!file.name.endsWith('.mbtiles')) {
          alert('Please select a valid .mbtiles file');
          return;
        }
      }
      handleUpload(file);
    }
  }, []);

  useEffect(() => {
    const handleResponse = (result: any) => {
      if (result.uploaded) {
        setUploading(false);
        setProcessing(true);
      } else if (result.error || result.canceled) {
        setUploading(false);
        setProcessing(false);
        setFailed(result.error);
        console.log('File upload was canceled or failed.', result);
      } else {
        setResults(result);
        setUploading(false);
        setProcessing(false);
        // Update state or perform any other actions with the result
      }
    };

    window.electron.ipcRenderer.on('upload-file-response', handleResponse);

    return () => {
      window.electron.ipcRenderer.removeListener(
        'upload-file-response',
        handleResponse,
      );
    };
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    useFsAccessApi: false,
    accept: {
      'application/x-sqlite3': ['.mbtiles'],
    },
  });
  return (
    <div>
      <div className="mt-4 text-center pb-4">
        <h1 className="text-2xl font-bold text-center">
          mbtiles to Mapeo ASAR conversion
        </h1>
        <span className="hidden bg-gray-500 text-white rounded-full px-4 py-2 uppercase">
          <b>Current State:</b>{' '}
          {(() => {
            if (uploading) return 'Uploading';
            if (processing) return 'Processing';
            if (results?.downloadUrl) return 'Ready to Download';
            if (failed) return 'Failed';
            return 'Idle';
          })()}
        </span>
      </div>
      <div>
        {results?.downloadUrl && (
          <div className="mt-4 flex flex-col items-center space-y-8">
            <button
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = results?.downloadUrl;
                link.download = '';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Download zip
            </button>
            <div className="mt-4 flex flex-col items-center max-w-[500px]">
              <h2 className="text-lg font-bold text-center py-2">
                Instructions
              </h2>
              <div className="tabs flex justify-center space-x-4 mt-4">
                <button
                  type="button"
                  className={`tab-button px-4 py-2 rounded-full font-semibold transition duration-300 ease-in-out ${
                    tab === 'desktop'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setTab('desktop')}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  className={`tab-button px-4 py-2 rounded-full font-semibold transition duration-300 ease-in-out ${
                    tab === 'mobile'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => setTab('mobile')}
                >
                  Mobile
                </button>
              </div>
              {tab === 'desktop' && (
                <div className="tab-content">
                  <h3 className="text-md font-bold text-center py-2">
                    Using the mapeo-asar-background-map.zip (Desktop)
                  </h3>
                  <ol className="list-decimal list-inside text-left">
                    <li>Locate the downloaded zip file on your computer.</li>
                    <li>Unzip the file by double-clicking it.</li>
                    <li>
                      The unzipped folder will contain a <code>default</code>{' '}
                      folder with the necessary contents.
                    </li>
                    <li>
                      Navigate to the Mapeo styles folder:
                      <ul className="list-disc list-inside ml-4">
                        <li>
                          <b>On Windows</b>: Open the AppData folder by typing{' '}
                          <code>%APPDATA%</code> in the Windows search bar, then
                          navigate to <code>Mapeo/styles</code>.
                        </li>
                        <li>
                          <b>On macOS</b>: Open Finder, click on <code>Go</code>{' '}
                          in the top menu, select <code>Go to Folder...</code>,
                          and type:
                          <br />
                          <code>
                            ~/Library/Application Support/Mapeo/styles
                          </code>
                        </li>
                        <li>
                          <b>On Linux</b>: Open your file explorer and navigate
                          to <code>~/.config/Mapeo/styles</code>.
                        </li>
                      </ul>
                    </li>
                    <li>
                      Copy the <code>default</code> folder from the unzipped
                      contents into the <code>Mapeo/styles</code> directory.
                    </li>
                    <li>
                      Restart Mapeo Desktop to apply the new background map.
                    </li>
                  </ol>
                </div>
              )}
              {tab === 'mobile' && (
                <div className="tab-content">
                  <h3 className="text-md font-bold text-center py-2">
                    Using the mapeo-asar-background-map.zip (Mobile)
                  </h3>
                  <ol className="list-decimal list-inside text-left">
                    <li>
                      Connect your smartphone to a computer using a USB cable.
                    </li>
                    <li>
                      Tap the "Charging this device via USB" notification on
                      your phone.
                    </li>
                    <li>Select "File Transfer" under "Use USB for".</li>
                    <li>
                      On your computer, locate and unzip the
                      mapeo-asar-background-map.zip file.
                    </li>
                    <li>
                      Copy the contents of the unzipped folder to your phone:
                      <ul className="list-disc list-inside ml-4">
                        <li>
                          Click on <b>Internal Shared Storage</b>, then on{' '}
                          <b>Android</b>, <b>data</b>, <b>com.mapeo</b>,{' '}
                          <b>files</b>, <b>styles</b>, and finally on{' '}
                          <b>default</b>.
                        </li>
                        <li>
                          Paste the background map elements into the{' '}
                          <b>default</b> folder.
                        </li>
                      </ul>
                    </li>
                    <li>
                      Restart the Mapeo Mobile app to apply the new background
                      map.
                    </li>
                  </ol>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
              className="bg-orange-500 text-white font-bold py-2 px-4 rounded-full shadow-lg hover:bg-red-700 transition duration-300 ease-in-out transform hover:scale-105"
            >
              Restart
            </button>
          </div>
        )}
        {failed && (
          <div className="my-4 text-center">
            <span className="bg-red-500 text-white rounded-full px-4 py-2 uppercase">
              <b>Error:</b> {failed.message || failed || 'Error'}
            </span>
          </div>
        )}
        {processing && (
          <div className="mt-4 text-center">
            <span className=" text-white uppercase">
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <b>Processing...</b>
              </div>
            </span>
          </div>
        )}
      </div>
      {!results?.downloadUrl && !processing && (
        <div
          {...getRootProps()}
          className="w-full p-3 py-36 border border-gray-500 border-dashed"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col md:flex-row gap-1.5 md:py-4">
            <div className="flex-grow flex items-center justify-center">
              {uploading ? (
                <div className="mx-auto w-80 text-center animate-bounce">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-6 w-6 mx-auto"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                  Uploading
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-14 h-14"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <strong className="text-sm font-medium">
                    Drag and drop a .mbtiles file here, or click to select file
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="mt-12 text-center text-white">
        Made with <span className="text-red">❤️</span> by{' '}
        <a href="https://awana.digital" className="text-white hover:underline">
          Awana Digital
        </a>
      </div>
    </div>
  );
}

export default SingleFileUploadForm;
