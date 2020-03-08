/*Supporting macros*/

/*make input terms of all files*/
%macro MakeInputTermsOfAllFiles (debug=);
	%local  i target name_fileinAZip debug NAMELIST2_FILESINAZIP;
	%let target=inputTerms;

	data &target; length name_file $100. inputTerms $2000.; delete;run;
	
	%let NAMELIST2_FILESINAZIP = &NAMELIST_FILESINAZIP inactive;

	/*add inactive into the name list. inactive is unique to the zip allfiles_ia. It is only to be used for creating input terms of all files.*/
	%put >>>>>>>>>>>>>>>>>> NameList2_filesInAZip = &NameList2_filesInAZip;

	%do i = 1 %to 12;
		%let name_fileinAZip = %scan(&NameList2_filesInAZip, &i);
		%put >>>>>>>>>>>>>>>>>> name_fileinAZip = &name_fileinAZip;
		%MakeInputTermsOfAFile(name_fileinAZip=&name_fileinAZip, target=MakeInputTermsOfAllFiles_tmp1);
		
		/*add the file name and input term into the target file*/
		data &target;
			set &target MakeInputTermsOfAllFiles_tmp1;
		run;
	%end;

	%if &debug ne 1 %then %do;
		proc datasets nolist;
			delete MakeInputTermsOfAllFiles_tmp:;
		run;quit;
	%end;

%mend MakeInputTermsOfAllFiles;

%macro LinkAllZips;

	%local zipname_file_surfix  i pathexists;

	/*make a folder 'database' if the folder does not exist*/
	/*	check if  the subfolder 'zips exists	*/
	%let pathexists = %sysfunc(filename(fileref,&localDatabasePath)) ;
	/*if the subfolder 'database' does not exist, create it. */
	%if &pathexists = 0 %then %do;
		/*specify to exit dos command window without typing 'exit' (noxwait)
			specify to wait and do not run the following sas programs until the x commands are done */
		options noxwait xsync;
		x "mkdir &localProjectPath.\database";
		/*return to the default settings on xwait and xsync*/
		opitons xwait xsync;
	%end;

	libname localt "&localDatabasePath";

	data dpd;
		format SRC $3. createDate date9.;	
		delete;
	run;	


	%do i = 1 %to 4;

		%let zipname_file_surfix =%scan(&zipnames_surfix, &i);
		%if &zipname_file_surfix=_ %then %let zipname_file_surfix =;

		%makedrugCodeList(zipname_file_surfix=&zipname_file_surfix);

		%linkfilesInAZip(zipname_file_surfix=&zipname_file_surfix);

		%if %length(&zipname_file_surfix)=0 %then %let zipname_file_surfix = mk;
		data LinkAllZips_tmp1;
			set linkedfile;
			SRC = symget('zipname_file_surfix');
/*			project=&_clientprojectname;*/
/*			program=&_clienttasklabel;*/
			createDate=date();
		run;

		data dpd;
			set dpd LinkAllZips_tmp1;
		run;

	%end;

	proc datasets nolist;
		delete LinkAllZips_tmp1;
	run;

	data localt.dpd; set dpd;run;

%mend  LinkAllZips;
%macro linkfilesInAZip(zipname_file_surfix=);

	%local  i srcfilename srcfilenameAndsurfix zipname_file_surfix;

	data linkedfile; set drugcodelist&zipname_file_surfix; if drug_code ne ''; run;

	%do i = 1 %to 11;

		%let srcfilename= %scan(&NameList_filesInAZip, &i);
		%let srcfilenameAndsurfix=&srcfilename.&zipname_file_surfix;

		proc sql; 
			create table linkedfile  as
				select *
				from linkedfile t1
				left join
				&srcfilenameAndsurfix t2
				on
				t1.drug_code = t2.drug_code
				;
		quit;run;
	
	%end;


	/*for the zip _ia, there is an additional file called inactive*/
	%if %lowcase(&zipname_file_surfix) = _ia %then %do;
		proc sql; 
		create table linkedfile  as
			select *
			from linkedfile t1
			left join
			inactive t2
			on
			t1.drug_code = t2.drug_code
			;
		quit;run;

	%end;

	proc sort data=linkedfile;
		by drug_code last_update_date;
	run;

%mend linkfilesInAZip;
%macro makedrugcodelist(zipname_file_surfix=, debug=);
		%local  i srcfilename srcfilenameAndsurfix zipname_file_surfix debug;

		data makedrugcodelist_tmp1;length DRUG_CODE 8. ;delete;run;

		%do i = 1 %to 11;
			%let srcfilename= %scan(&NameList_filesInAZip, &i);
			%let srcfilenameAndsurfix=&srcfilename.&zipname_file_surfix;
			data makedrugcodelist_tmp1;
				set makedrugcodelist_tmp1 &srcfilenameAndsurfix(keep=drug_code);
			run;			
		%end;
		
		proc sort data=makedrugcodelist_tmp1;
			by DRUG_CODE;
		run;

		proc sql; 
			create table drugcodelist&zipname_file_surfix as
				select distinct drug_code
				from makedrugcodelist_tmp1
			;
		quit;run;

		/*for the zip _ia, there is an additional file called inactive*/
		%if %lowcase(&zipname_file_surfix) =_ia %then %do;
			data makedrugcodelist_tmp3;
				set drugcodelist&zipname_file_surfix inactive;
			run;
			proc sql; 
			create table drugcodelist&zipname_file_surfix as
				select distinct drug_code
				from makedrugcodelist_tmp3
				;
			quit;run;
		%end;

		%if &debug ne 1 %then %do;
			proc datasets nolist;
				delete makedrugcodelist_tmp:;
			run;quit;
		%end;

		/*check if all drug_code can be found in the file 'drug'. Not really!*/
/*		%compAB(a=drug, b=drugcodelist&zipname_file_surfix, target=test, vars=drug_code);	*/
%mend makedrugcodelist;
/*a macro to extract txt files from zips and save as sas datasets*/
%macro importADataFile (srcfilename=, zipname_file_surfix=);

	%local zipname srctxtname targetsetname inputterms srcfilename zipname_file_surfix inputFormat;
	
	%let zipname=allfiles&zipname_file_surfix;
	%let srctxtname=&srcfilename&zipname_file_surfix;
	/*inactive is a special case*/
	%if &srcfilename=inactive %then %let srctxtname=inactive;
	%let targetsetname=&srctxtname;


	/*1. let SAS know that the source is a zip file which contains files and folders. */
	/*specify the zip file*/
	filename thezip zip "&localZipsPath.\&zipname..zip";

	/*a) copy the member file into work directory */
	filename thetxt "%sysfunc(getoption(work))/importdata_tmp.txt" ;
	data _null_;
	  	infile  thezip(&srctxtname..txt) ;
	  	file thetxt;
		input;
		put _infile_;
	run;

	/*b) get the input format*/
	data _null_;
		set INPUTTERMS;
		if lowcase(strip(name_file)) = lowcase(strip(symget('srcfilename')));
		call symput('inputterms', inputterms);
		call symput('inputvartypes', inputvartypes);
		if strip(inputFormat) ne '' then call symput('inputFormat', inputFormat);
	run;

	%put >>> inputterms=&inputterms;
	%put >>> inputvartypes=&inputvartypes;
	%put >>> inputFormat=&inputFormat;

	/*c) input data into the table*/
	data &targetsetname missingdrugcode_&targetsetname;
		infile thetxt dsd missover;
		input &inputterms ;
		%if %length(&inputFormat) ne 0 %then %do;
			format &inputFormat;
		%end;
		if drug_code = . then output missingdrugcode_&targetsetname;
		else output  &targetsetname;
	run;
	%let inputterms=;%let inputvartypes=; %let inputFormat=;

%mend importADataFile;
%macro importDataInAZip( zipname_file_surfix=);
	%local zipname_file  zipname_cols srcfilename srcfilenameAndsurfix  zipname_file_surfix i;

	%do i =1 %to 11;
		%let srcfilename= %scan(&NameList_filesInAZip, &i);

		%put >>> srcfilename= &srcfilename;

		%importADataFile(
			srcfilename=&srcfilename, 
			zipname_file_surfix=&zipname_file_surfix 
		);
		
		data missingDrugCode_&srcfilename.&zipname_file_surfix;
			set missingDrugCode_&srcfilename.&zipname_file_surfix;
			name_file=symget('srcfilename');
			surfix_zipname=symget('zipname_file_surfix');
			keep drug_code name_file surfix_zipname;
		run;

		data missingDrugCode;
			set missingDrugCode missingDrugCode_&srcfilename.&zipname_file_surfix;			
		run;

	%end;

	/*an additional for inactive.txt*/
	%if %lowcase(&zipname_file_surfix)=_ia %then %do;

		%importADataFile(
			srcfilename=inactive, 
			zipname_file_surfix=_ia 
		);

		data missingDrugCode_&srcfilename.&zipname_file_surfix;
			set missingDrugCode_&srcfilename.&zipname_file_surfix;
			name_file='inactive';
			surfix_zipname=symget('zipname_file_surfix');
			keep drug_code name_file surfix_zipname;
		run;
		data missingDrugCode;
			set missingDrugCode missingDrugCode_&srcfilename.&zipname_file_surfix;			
		run;

	%end;


%mend importDataInAZip;
%macro importDataFromAllZips;

	%local zipname_file  zipname_cols  List_zipnames  i zipname_file_surfix;	

	%do i = 1 %to 4;
		
		%let zipname_file_surfix = %scan(&zipnames_surfix, &i);
		%if &zipname_file_surfix=_ %then %let zipname_file_surfix =;

		%importDataInAZip(
				zipname_file_surfix=&zipname_file_surfix
		);

	%end;
%mend importDataFromAllZips;

%macro MakeInputTermsOfAFile (name_fileinAZip=, target=, debug=);
	%local name_fileinAZip target debug;

	/*to split the var names, var type, and var length*/
	data MakeInputTermsOfAFile_tmp1;
		set &name_fileinAZip.Col_raw;
		if index(type, '(') > 0 then do;
			type1=scan(type, 1, "(");
			varLen =tranwrd(scan(type, 2, "("), ")", "");
		end;
		else type1 = type;
		length varType $20. varInFormat $20. inputvar $100. inputVarType $100. inputTerm $100. varoutFormat $100.;
		select ;
			when (lowcase(type1) ='varchar2') varType='$';
			when (lowcase(type1) ='number') varType='';
			when (lowcase(type1) ='date') varType=''; 
			otherwise varType='wrong'; 
		end;
		if lowcase(type1) ='date' then do;
			varLen='anydtdte11';
			varoutFormat =strip(name) || ' ' || 'date9.';
		end;
		varInFormat = strip(varType) || strip(varLen) || ".";
		inputvar = strip(name);
		inputVarType=strip(name) || ' ' || varType;
		inputTerm= strip(name) || ' :' || strip(varinformat);
		keep inputvar inputVarType inputTerm varoutFormat;
	run;

	/*to concatenate the input terms together into one string, like 'DRUG_CODE 8.DRUG_IDENTIFICATION_NUMBER $29.BRAND_NAME $200.HISTORY_DATE anydtdte11.'*/
	data &target;
		set MakeInputTermsOfAFile_tmp1 end=last;
		length name_file $100. inputVars $2000. inputVarTypes $2000. inputTerms $2000. inputFormat $2000.;
		retain inputVars inputVarTypes inputTerms inputFormat;
		if _n_=1 then do;
			inputvars=inputvar;
			inputVarTypes=inputVarType;
			inputTerms=inputterm;
			inputFormat=varoutFormat;
		end;
		else do;
			inputvars = strip(inputvars) || ' ' || inputvar;
			inputVarTypes = strip(inputVarTypes) || ' ' || inputVarType;
			inputTerms  = strip(inputTerms) || ' ' || inputterm;
			inputFormat  = strip(inputFormat) || ' ' || varoutFormat;
		end;
		if last;
		name_file = symget('name_fileinAZip');
		keep name_file inputvars inputVarTypes  inputTerms inputFormat;
	run;
	
	%if &debug ne 1 %then %do;
		proc datasets nolist;
			delete MakeInputTermsOfAFile_tmp:;
		run;quit;
	%end;

%mend MakeInputTermsOfAFile;

%macro downloaddpdFiles;

	%local ziplist zipname i;
	%let ziplist =allfiles allfiles_ia allfiles_ap allfiles_dr;

	/*make a folder 'zips' if the folder does not exist*/
	/*	check if  the subfolder 'zips exists	*/
	%let zipsexists = %sysfunc(filename(fileref, &localZipsPath)) ;
/*	%put zipsexists = &zipsexists;*/
	/*if the subfolder 'zips' does not exist, create it. */
	%if &zipsexists = 0 %then %do;
		/*specify to exit dos command window without typing 'exit' (noxwait)
			specify to wait and do not run the following sas programs until the x commands are done */
		options noxwait xsync;
		x "mkdir &localProjectPath.\zips";
		/*return to default settings on xwait and xsync*/
		options xwait xsync;
	%end;

	%do i = 1 %to 4;
		%let zipname = %scan(&ziplist, &i);
		%put >>> the current zipname is &zipname;
		filename target "&localZipsPath.\&zipname..zip";
		/*the URL var is defined in the main program
			it is comprised of a fixed string and a var &zipname:
			%let URL = https://.../&zipname..zip;
			despite that URL was only defined once, its value changes corresponding to the value in &zipname
			So in this loop, each time the URL value will be different depending on the vallue of the var &zipname
		*/
		%put >>> the URL is: &URL;
		proc http  url="&URL"  method="get" out=target; 
		run;
	%end;

%mend downloaddpdFiles;

/*Get the path of the current sas program or the current SAS enterprise guide project*/
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


/*input var names*/

/*the vars and types are defined according to the page:
https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/drug-product-database/read-file-drug-product-database-data-extract.html
*/
/*
The following vars may exceed the planned length, and the length were redefined

COMPANY_NAME, DESCRIPTOR, PRODUCT_INFORMATION, SUITE_NUMBER, DRUG_IDENTIFICATION_NUMBER, 
POST_OFFICE_BOX, UPC, ACCESSION_NUMBER, MFR_CODE, PACKAGE_SIZE
ADDRESS_MAILING_FLAG 
ADDRESS_BILLING_FLAG 
ADDRESS_NOTIFICATION_FLAG 
ADDRESS_OTHER 
BASE
CURRENT_STATUS_FLAG
INGREDIENT_SUPPLIED_IND
PEDIATRIC_FLAG
*/

data _null_;run;

/*https://stats.idre.ucla.edu/sas/faq/how-do-i-read-in-a-character-variable-with-varying-length-in-a-space-delimited-dataset/*/
/*
Max 102
NOTES VARCHAR2(2000)
max 261
INGREDIENT_F VARCHAR2(400)
max 191
INGREDIENT VARCHAR2(240)
max 20
DOSAGE_UNIT_F VARCHAR2(80)
max 1
STRENGTH_TYPE_F VARCHAR2(80)
max 9
DOSAGE_UNIT VARCHAR2(40)
max 1
STRENGTH_TYPE VARCHAR2(40)
max 12
STRENGTH_UNIT VARCHAR2(40)
max 1
BASE VARCHAR2(1)
max 1
INGREDIENT_SUPPLIED_IND VARCHAR2(1)
*/
data ingredCol_raw;
/* length name $100. type $100.;*/
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
ACTIVE_INGREDIENT_CODE NUMBER(6)
INGREDIENT VARCHAR2(200)
INGREDIENT_SUPPLIED_IND VARCHAR2(2)
STRENGTH VARCHAR2(20)
STRENGTH_UNIT VARCHAR2(20)
STRENGTH_TYPE VARCHAR2(1)
DOSAGE_VALUE VARCHAR2(20)
BASE VARCHAR2(2)
DOSAGE_UNIT VARCHAR2(10)
NOTES VARCHAR2(110)
INGREDIENT_F VARCHAR2(270)
STRENGTH_UNIT_F VARCHAR2(80)
STRENGTH_TYPE_F VARCHAR2(1)
DOSAGE_UNIT_F VARCHAR2(20)
;

/*
Max=21
COUNTRY_F VARCHAR2(100)
Max=23
PROVINCE_F VARCHAR2(100)
max=80
COMPANY_NAME VARCHAR2(80)
max 36
CITY_NAME VARCHAR2(60)
max 9
COMPANY_TYPE VARCHAR2(10)
max 18
COUNTRY VARCHAR2(40)
max 27
PROVINCE VARCHAR2(40)
max 20
SUITE_NUMBER VARCHAR2(20)
max 15
POST_OFFICE_BOX VARCHAR2(15)
max 5
MFR_CODE VARCHAR2(5)
max 1
ADDRESS_MAILING_FLAG VARCHAR2(1)
max 1
ADDRESS_BILLING_FLAG VARCHAR2(1)
max 1
ADDRESS_NOTIFICATION_FLAG VARCHAR2(1)
max 1
ADDRESS_OTHER VARCHAR2(1)
*/
data compCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
MFR_CODE VARCHAR2(10)
COMPANY_CODE NUMBER(6)
COMPANY_NAME VARCHAR2(100)
COMPANY_TYPE VARCHAR2(40)
ADDRESS_MAILING_FLAG VARCHAR2(2)
ADDRESS_BILLING_FLAG VARCHAR2(2)
ADDRESS_NOTIFICATION_FLAG VARCHAR2(2)
ADDRESS_OTHER VARCHAR2(2)
SUITE_NUMBER VARCHAR2(40)
STREET_NAME VARCHAR2(80)
CITY_NAME VARCHAR2(40)
PROVINCE VARCHAR2(30)
COUNTRY VARCHAR2(20)
POSTAL_CODE VARCHAR2(20)
POST_OFFICE_BOX VARCHAR2(20)
PROVINCE_F VARCHAR2(30)
COUNTRY_F VARCHAR2(30)
;

/*
max 118
BRAND_NAME_F VARCHAR2(300)

*/

/*
max 150
DESCRIPTOR VARCHAR2(150)
max 134
DESCRIPTOR_F VARCHAR2(200)
max 20
CLASS_F VARCHAR2(80)
max 50
PRODUCT_CATEGORIZATION VARCHAR2(80)
max 19
CLASS VARCHAR2(40)
max 29
DRUG_IDENTIFICATION_NUMBER VARCHAR2(29)
max 10
AI_GROUP_NO VARCHAR2(10)
max 5
ACCESSION_NUMBER VARCHAR2(5)
max 1
PEDIATRIC_FLAG VARCHAR2(1)
*/
data drugCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
PRODUCT_CATEGORIZATION VARCHAR2(50)
CLASS VARCHAR2(20)
DRUG_IDENTIFICATION_NUMBER VARCHAR2(40)
BRAND_NAME VARCHAR2(200)
DESCRIPTOR VARCHAR2(200)
PEDIATRIC_FLAG VARCHAR2(2)
ACCESSION_NUMBER VARCHAR2(10)
NUMBER_OF_AIS VARCHAR2(10)
LAST_UPDATE_DATE DATE
AI_GROUP_NO VARCHAR2(20)
CLASS_F VARCHAR2(20)
BRAND_NAME_F VARCHAR2(120)
DESCRIPTOR_F VARCHAR2(140)
;

/*
Max 37
STATUS_F VARCHAR2(80)
Max 1
CURRENT_STATUS_FLAG VARCHAR2(1)
*/

data statusCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
CURRENT_STATUS_FLAG VARCHAR2(2)
STATUS VARCHAR2(40)
HISTORY_DATE DATE
STATUS_F VARCHAR2(40)
LOT_NUMBER VARCHAR2(50)
EXPIRATION_DATE DATE
;

/*
Max 51
PHARMACEUTICAL_FORM_F VARCHAR2(80)
Max 40
PHARMACEUTICAL_FORM VARCHAR2(40)
*/
data formCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
PHARM_FORM_CODE NUMBER(7)
PHARMACEUTICAL_FORM VARCHAR2(60)
PHARMACEUTICAL_FORM_F VARCHAR2(60)
;

/*
Max 1
PACKAGE_SIZE_UNIT_F VARCHAR2(80)
Max 1
PACKAGE_TYPE_F VARCHAR2(80)
Max 80
PRODUCT_INFORMATION VARCHAR2(80)
max 12
PACKAGE_SIZE_UNIT VARCHAR2(40)
max 21
PACKAGE_TYPE VARCHAR2(40)
max 12
UPC VARCHAR2(12)
max 5
PACKAGE_SIZE VARCHAR2(5)
*/
data packageCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
UPC VARCHAR2(20)
PACKAGE_SIZE_UNIT VARCHAR2(20)
PACKAGE_TYPE VARCHAR2(25)
PACKAGE_SIZE VARCHAR2(10)
PRODUCT_INFORMATION VARCHAR2(100)
PACKAGE_SIZE_UNIT_F VARCHAR2(1)
PACKAGE_TYPE_F VARCHAR2(1)
;

/*
max 6
PHARMACEUTICAL_STD VARCHAR2(40)
*/
data pharmCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
PHARMACEUTICAL_STD VARCHAR2(10)
;


/*
max=61
ROUTE_OF_ADMINISTRATION_F VARCHAR2(80)
*/
data routeCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
ROUTE_OF_ADMINISTRATION_CODE NUMBER(6)
ROUTE_OF_ADMINISTRATION VARCHAR2(40)
ROUTE_OF_ADMINISTRATION_F VARCHAR2(65)
;

/*
max 26
SCHEDULE_F VARCHAR2(160)
max 24
SCHEDULE VARCHAR2(40)
*/
data scheduleCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
SCHEDULE VARCHAR2(30)
SCHEDULE_F VARCHAR2(30)
;

/*
max=78
TC_ATC VARCHAR2(120)
max=1
TC_ATC_F VARCHAR2(240)
max=55
TC_AHFS_F VARCHAR2(160)
max 8
TC_ATC_NUMBER VARCHAR2(8)
*/
data therCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
TC_ATC_NUMBER VARCHAR2(10)
TC_ATC VARCHAR2(80)
TC_AHFS_NUMBER VARCHAR2(20)
TC_AHFS VARCHAR2(80)
TC_ATC_F VARCHAR2(1)
TC_AHFS_F VARCHAR2(60)
;

/*
max=42
VET_SPECIES_F VARCHAR2(160)
max 44
VET_SPECIES VARCHAR2(80)
max 30
VET_SUB_SPECIES VARCHAR2(80)
*/

data vetCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
VET_SPECIES VARCHAR2(50)
VET_SUB_SPECIES VARCHAR2(40)
VET_SPECIES_F VARCHAR2(50)
;
/*rename the columns of DIN, brand name, history date, so that they won't be duplciated with the same columns in other files*/
data inactiveCol_raw;
 input name :$100. type :$100.;
 cards;
DRUG_CODE NUMBER(8)
DRUG_IDENTIFICATION_NUMBER_IA VARCHAR2(29)
BRAND_NAME_IA VARCHAR2(200)
HISTORY_DATE_IA DATE
;
