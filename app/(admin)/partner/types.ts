export type PartnerProgramRow = {
	Id: number;
	"Partner Program Name": string;
	Description: string;
	"Verification Step": boolean;
	Template: string;
	"Login Template": string;
	"Login Script": string;
}

export type ModalType = 'partner' | 'program' | null

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
