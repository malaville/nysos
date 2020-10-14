export class BibliographyItem {
    id: string;

    constructor(
        public title="",
        public link="",
        public description="",
        public acronym = "DOC",
        public author = "",
        public year = new Date().getFullYear(),
        public targets: string[] = ['2303874987398739'],
        public specificDescriptions: {[id: string]: string} = {}
    ){}

}