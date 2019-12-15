The programs in this folder are for creating a SAS data set of drug products registered in Canada. The target data set is called dad.sas7bdat. It contians data of the drug product database provided by Health Canada (https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/drug-product-database.html). 

Created by Shenzhen YAO
Last modified: 2019-12-12
Copyrights(c) 2019 Shenzhen YAO (see license)


System requirement:
- Windows 7 or above (Currently the programs only support the WINDOWS environment)
- SAS 9.4
- Enterprise guide 7.1 or above (optional).
- At least 1.3 gigabytes of space in the local drive.

List of files:
1. getdad.sas
2. supporting.sas
3. getdad.egp
4. README.md

Installation:
Create a folder in the local drive (e.g., c:\dadproject). Save the two SAS files (i..e, getdad.sas, supporting.sas, and getdad.egp) into the newly created folder.

Running SAS programs and creating dad.sas7bdat:

1. Using SAS 9.4:
a. In SAS 9.4, find the newly created project folder (e.g., c:\dataproject in installation), and open the file 'getdad.sas'
b. Run the whole program in the file 'getdad.sas'.

2. Using SAS Enterprise 7.1 or above with SAS 9.4:
a. In SAS Enterprise, find the newly created project folder (e.g., c:\dataproject in installation), and open the file 'getdad.egp'.
b. Runt the program 'getdad'

The programs will create two subfolders under the newly created project folder. The subfolder 'zips' is where the downloaded zip files will be saved. The subfolder 'database' is where the final dad.sas7bdat file will be saved. Note: the final dataset is about 1.3 gigabytes, so make sure there is enough space on the selected local drive. 

Enjoy.
