export class ObjectInfo {
    public className: string=""; 
    public attributs: ObjectAttributes[]= []

    public addAttributes(name:string, type: string){
        this.attributs.push(new ObjectAttributes(name, type))
    } 
}

export class ObjectAttributes {

    constructor(
      public name: string,
      public type: string
    ){}

    getDefaultValue(){
        return this.types[this.type.trim()];
    }

    private types = {
        "string": "\"\"",
        "boolean": "true",
        "number":"-1",
        "Moment": "moment()"
    }
}
/*
export interface SquareConfig {
    public color: string;
    private width: number;
    protected tessst: boolean;
}
*/