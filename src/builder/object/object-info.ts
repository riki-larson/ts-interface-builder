export class ObjectInfo {
    public className: string=""; 
    public attributs: ObjectAttributes[]= []

    public addAttributes(name:string, type: string){
        this.attributs.push(new ObjectAttributes(name, type))
    } 
    getClassNameVariable(){
        return 'monObject';
    }
}

export class ObjectAttributes {

    constructor(
      public name: string,
      public type: string
    ){}

    getDefaultValue(){
        let typeDeObjet = this.type.trim()
        if(contient(typeDeObjet, '[]')){
            return "[]"
        }
        return this.typesChampSimple[this.type.trim()];
    }

    private typesChampSimple = {
        "string": "\"\"",
        "boolean": "true",
        "number":"-1",
        "Moment": "moment()"
    }

    public getField(){
        return "private " + this.name + ": " + this.type + " = " + this.getDefaultValue() + ";";
    }

    getAffectation(){
        return "builder." + this.name + " = existant." + this.name;
    }

    addSetter(objectName) {
        if(this.contient("[]")){
            return this.addSetterTableau(objectName)
        }
        return this.addSetterNonTableau(objectName);
    }

    private typePrimitif: string[] = ["string", "number", "boolean"]

    contient(rechercher){
        return contient(this.type.trim(), rechercher);
    }

    addSetterTableau(objectName){
        return ["public ajouter" + capitalize(this.name) + "(v: " + this.getSansTableau() + "): " + objectName + " {"
            , "this." + this.name + ".push(v);"
            , "return this;"
            , "}"].join("\n") + "\n";
    }

    getNomSetter(){
        if(this.contient("[]")){
            return "ajouter" + capitalize(this.name)
        }
        return "avec" + capitalize(this.name)
    }

    addSetterNonTableau(objectName){
        return ["public avec" + capitalize(this.name) + "(v: " + this.type + "): " + objectName + " {"
            , this.getSetterNonTableau()
            , "return this;"
            , "}"].join("\n") + "\n";
    }

    getSetterNonTableau(){
        if(this.typePrimitif.indexOf(this.type) == -1){
            return "this." + this.name + "= v; //COMMENT INSTANCIER UN NOUVEAU "
        }
        return "this." + this.name + "=v;"
    }
    getSansTableau(){
        return this.type.split("[")[0]
    }

    createExpect(className, nomObject){
        if(this.contient("[]")){
            return "expect(" +nomObject+"."+this.name+").to.be.contains(valeur);"
        }
        return "expect(" +nomObject+"."+this.name+").to.be.equal(valeur);"
    }
}

export function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    export function contient(string, rechercher){
        return string.indexOf(rechercher) != -1;
    }
/*
export interface SquareConfig {
    public color: string;
    private width: number;
    protected tessst: boolean;
    private test2: string;
    private obj: RoundConfig;
    private tableau: string[];
    private ronds: RoundConfig[]
}
*/