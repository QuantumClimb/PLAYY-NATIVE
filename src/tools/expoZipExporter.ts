import JSZip from 'jszip';
import { EXPO_PROJECT_FILES } from './expoProjectFiles';

export async function downloadExpoProjectZip(projectName = 'playys-expo-app'): Promise<void> {
  const zip = new JSZip();

  // Root project files
  EXPO_PROJECT_FILES.forEach((file) => {
    zip.file(file.path, file.content);
  });

  // Assets directory with basic placeholder files
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    assetsFolder.file('README.txt', 'Place your custom icon.png, splash-icon.png, and adaptive-icon.png here.');
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
