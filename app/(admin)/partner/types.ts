export type PartnerProgramRow = {
	Id: number;
	"Partner Program Name": string;
	Description: string;
	"Verification Step": boolean;
	Template: string;
	"Login Template": string;
	"Login Script": string;
}

export type ModalType = 'partner' | 'program' | 'edit-partner' | null;

export type PartnerRow = {
    Id: number;
    "External id": number | null;
    "partner Name": string | null;
    "parent Partner": string | null;
    "PM Id": string | null;
    URL: string | null;
    Email: string | null;
}



export type PartnerFormValues = {
	'External id': number | null;
	'partner Name': string;
	'parent Partner': string;
	'PM Id': string;
	URL: string;
	Email: string;
}

export type ProgramFormValues = {
	'Partner Program Name': string;
	Description: string;
	'Verification Step': boolean;
	Template: string;
	'Login Template': string;
	'Login Script': string;
}
