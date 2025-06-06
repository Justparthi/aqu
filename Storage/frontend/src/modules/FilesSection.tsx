import React, { useState } from 'react';
import { FaFile, FaPlus, FaUpload, FaTrash, FaFolder, FaEllipsisV } from 'react-icons/fa';
import styles from './FilesSection.module.css';

interface FileItem {
  name: string;
  type: string;
}

interface FilesSectionProps {
  files?: FileItem[];
}

const FilesSection: React.FC<FilesSectionProps> = ({ files = [] }) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  // Default sample files if none provided
  const defaultFiles: FileItem[] = [
    { name: "file1.txt", type: "file" },
    { name: "file2.txt", type: "file" },
  ];

  const displayFiles = files.length > 0 ? files : defaultFiles;

  const actionItems = [
    { icon: FaPlus, label: "New Folder", action: () => console.log("New folder") },
    { icon: FaUpload, label: "Upload", action: () => console.log("Upload") },
    { icon: FaTrash, label: "Delete Folder", action: () => console.log("Delete folder") },
    { icon: FaFolder, label: "", action: () => console.log("Archive") }
  ];

  const handleDropdownToggle = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleDropdownAction = (action: string, fileIndex: number) => {
    console.log(`${action} for file ${fileIndex}`);
    setActiveDropdown(null);
  };

  return (
    <div className={styles.filesSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Files</h3>
        <div className={styles.actionItems}>
          {actionItems.map((item, index) => (
            <div key={index} className={styles.actionItem} onClick={item.action}>
              <item.icon className={styles.actionIcon} />
              <span className={styles.actionLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.filesGrid}>
        {displayFiles.map((file, index) => (
          <div key={index} className={styles.fileBox}>
            <div className={styles.fileHeader}>
              <span className={styles.fileTitle}>{file.name}</span>
              <div className={styles.dropdownContainer}>
                <button 
                  className={styles.dropdownButton}
                  onClick={() => handleDropdownToggle(index)}
                >
                  <span className={styles.threeDots}>•••</span>
                </button>
                {activeDropdown === index && (
                  <div className={styles.dropdownMenu}>
                    <button 
                      className={styles.dropdownOption}
                      onClick={() => handleDropdownAction('Download', index)}
                    >
                        <FaFile style={{width:"20px"}} />
                      Download
                    </button>
                    <button 
                      className={styles.dropdownOption}
                      onClick={() => handleDropdownAction('Delete', index)}
                    >
                      <FaTrash className={styles.deleteIcon} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.fileContent}>
              <FaFile className={styles.fileIcon} />
              <span className={styles.fileType}>{file.type.toUpperCase()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilesSection;