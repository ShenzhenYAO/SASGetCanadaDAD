/*
Creating a SAS data set of drug products registered in Canada. 
The target data set is called dad.sas7bdat. 
It contians data of the drug product database provided by Health Canada 
(https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/drug-product-database.html).

Created by Shenzhen YAO
Last modified: 2019-12-12

Copyrights: feel free to use, copy, and make adaptation as long as the creator (Shenzhen YAO) is acknowledged, :-). 
*/

/*macro to determine the path of the current sas program*/
%macro getThisPath;
	%global currentPath;
	%local thisprogramNamePath thisprogramName thisprogramPath thisprojectNamePath thisprojectName thisProjectPath;
	/*If running SAS enhance editor:
	http://support.sas.com/kb/24/301.html
	*/
	/*a) Get the current SAS program's name and fullpath path
	e.g.,  C:\Users\Z70\Desktop\test.sas
	*/
	%let thisprogramNamePath =  %sysget(SAS_EXECFILEPath);
	/*b) Get the current SAS program's name
	e.g.,  test.sas*/
	%let thisprogramName =  %sysget(SAS_EXECFILEName);
	/*c) using a) substracting b) to have the path of the current sas program
	e.g., C:\Users\Z70\Desktop\*/
	%let thisprogramPath = %substr(
											&thisprogramNamePath, 1, 
											%eval(
													%length(&thisprogramNamePath)-%length(&thisprogramName)
													)
											);
	/**/
	/*%put >>> &thisprogramNameFullPath;*/
	/*%put >>> &thisprogramName;*/
	/*%put >>> &thisprogramPath;*/

	/*alternatively, if running in sas EG:*/
	%let thisprojectNamePath = %sysfunc(dequote(&_clientprojectPath));
	%let thisprojectName = %sysfunc(dequote(&_clientprojectName));
	%let thisProjectPath = %substr(
											&thisprojectNamePath, 1, 
											%eval(
													%length(&thisprojectNamePath)-%length(&thisprojectName)
													)
											);

	/*%put >>> &thisprojectNamePath;*/
	/*%put >>> &thisprojectName;*/
	/*%put >>> &thisProjectPath;*/

	%if %length(&thisprogramPath)=0 %then %do;
		%let currentPath = &thisProjectPath;
	%end;
	%else %do;
		%let currentPath = &thisprogramPath;
	%end;

	%if %substr(&currentPath, %length(&currentPath), 1) =\ %then %let currentPath=%substr(&currentPath, 1, %eval(%length(&currentPath)-1));

%mend getThisPath;

%global localProjectPath localZipsPath localDataBasePath zipnames_surfix NameList_filesInAZip URL;

/*Get the path of the current SAS program*/
%getThisPath;
/*set values of global variables*/
%let localProjectPath=&currentPath;
%let localZipsPath = &localProjectPath.\zips;
%let localDatabasePath = &localProjectPath.\database;
%let zipnames_surfix = _ _ia _ap _dr;
%let NameList_filesInAZip = vet ther status schedule route pharm package ingred form drug comp;
%let URL=https://www.canada.ca/content/dam/hc-sc/documents/services/drug-product-database/&zipname..zip;

/*load the supporint macros*/
%include "&localProjectPath.\supporting.sas";

/*prepare an empty dataset to hold error records*/
data missingDrugCode;
	length name_file $100. surfix_zipname $3.;
	delete;
run;

/*1. make input terms of all variables*/
%MakeInputTermsOfAllFiles;
/*2. download the zip files*/
%downloadPDPFiles;
/*3. import data from txt files in zips*/
%importDataFromAllZips;
/*4. Link all the data sets and make the final database: DAD.sas7bdat*/
%LinkAllZips;
/*5. report the error rows when reading txt files into data sets*/
Title "Rows that were ignored when reading txt files into data sets";
proc print data=missingDrugCode;
run;
title;

	