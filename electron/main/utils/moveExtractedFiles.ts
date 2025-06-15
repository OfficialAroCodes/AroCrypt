import fs from "fs";
import path from "path";

const moveExtractedFiles = async (
  extractedPaths: string[],
  finalOutputPath: string
): Promise<string[]> => {
  const movedPaths: string[] = [];

  for (const filePath of extractedPaths) {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(finalOutputPath, fileName);
    
    // Move the file
    await fs.promises.rename(filePath, destinationPath);
    movedPaths.push(destinationPath);
  }

  return movedPaths;
};

export default moveExtractedFiles; 