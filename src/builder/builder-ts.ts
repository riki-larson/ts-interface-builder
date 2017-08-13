import { ObjectAttributes, ObjectInfo } from './object/object-info';

const CLASS_NAME_REGEX = /\s*export\s*interface\s([\S]+)\s*{/;

export function parseTypescript(typescriptAsString: string): Promise<string> {
    let lines: string[] = typescriptAsString.split('\n');
    let objectInfo: ObjectInfo = new Parser(lines).process();
    let builderAsString: string = new BuilderAsString(objectInfo).process()
    return Promise.resolve(builderAsString);
}

class Parser {

    constructor(private lines: string[]) { }

    private objectInfo: ObjectInfo = new ObjectInfo();

    public process(): ObjectInfo {
        this.lines.forEach(element => this.parserLine(element));
        return this.objectInfo;
    }

    public parserLine(line: string) {
        this.parseClassName(line);
        this.parseAttributes(line);
    }

    public parseClassName(line: string) {
        let result = new RegExp(CLASS_NAME_REGEX).exec(line);
        if (result) {
            console.log(result[1])
            this.objectInfo.className = result[1]
        }
    }

    public parseAttributes(line: string) {
        let result = new RegExp(/(\w+):\s+(\w+[0-9]*\[*\]*);/).exec(line);
        if (result) {
            console.log(result[1])
            console.log(result[2])
            let attributeName = result[1]
            let attributeType = result[2]
            this.objectInfo.addAttributes(attributeName, attributeType);
        }
    }
}

const SAUT = '\n'
class BuilderAsString {

    constructor(private objectInfo: ObjectInfo) { }

    private name: string = "";

    process(): string {
        this.name = this.objectInfo.className + "Builder";
        return [
            "export class " + this.name + " {"
            + SAUT
            + this.addAttributes()
            + this.addConstructor(this.name)
            + this.addSetters()
            + "}"].join(SAUT)

            + this.genererClassTest()
    }

    addConstructor(name): string {
        return SAUT
            + "private constructor(){}"
            + SAUT

            + SAUT
            + ["public static creer(): " + name + " { "
                , "return new " + name + "();"
                , "}"
            ].join(SAUT)
            + SAUT

            + SAUT
            + ["public static creerDepuisExistant( existant :" + this.objectInfo.className + "): " + name + " { "
                , "let builder = new " + name + "();"
                , this.objectInfo.attributs.map(attribut => attribut.getAffectation()).join(SAUT)
                , "return builder;"
                , "}"
            ].join(SAUT)
            + SAUT

            + SAUT
            + ["public build(): " + this.objectInfo.className + " {"
                , "return {"
                , this.objectInfo.attributs.map(a => "\"" + a.name + "\": this." + a.name + ",").join(SAUT)
                , "}"
                , "}"
            ].join(SAUT)
            + SAUT
    }



    addAttributes() {
        return SAUT
            + this.objectInfo.attributs.map(attribute => attribute.getField()).join(SAUT)
            + SAUT;
    }

    addSetters() {
        return SAUT
            + this.objectInfo.attributs.map(attribute => attribute.addSetter(this.name)).join(SAUT)
            + SAUT;
    }


    genererClassTest(): string {
        return SAUT
            + "const " + this.objectInfo.className.toUpperCase() + ": " + this.objectInfo.className + " = null; //TODO"
            + SAUT+ SAUT +["describe(\'" + this.name + "\', () => {"
                , this.genererTestCreer()
                , this.objectInfo.attributs.map(a => this.ajouterTest(a)).join(SAUT)
                , SAUT
                , "})"].join(SAUT);
    }

    genererTestCreer(): string {
        return [
            "it(\'creer\', () => {"
            , "let " + this.objectInfo.getClassNameVariable() + ": " + this.objectInfo.className + " = " + this.name + ".creerDepuisExistant(" + this.objectInfo.className.toUpperCase() + ")"
            , this.genererSettersComplets()
            , ".build();"
            , "expect("+this.objectInfo.getClassNameVariable()+").to.exist;"
            , "});"
        ].join(SAUT)
    }

    genererSettersComplets(): string{
        return this.objectInfo.attributs.map(attribut => this.genererSetter(attribut)).join(SAUT)
    }
    genererSetter(attribut: ObjectAttributes){
        return "." + attribut.getNomSetter() + "("+this.objectInfo.className.toUpperCase()+"."+attribut.name+")";
    }

    ajouterTest(a: ObjectAttributes): string {
        return SAUT + [
            "it(\'" + a.getNomSetter() + "\', () => {"
            , "let valeur: " + a.getSansTableau() + " = null; //TODO"
            , "let " + this.objectInfo.getClassNameVariable() + ": " + this.objectInfo.className + " = " + this.name + ".creerDepuisExistant(" + this.objectInfo.className.toUpperCase() + ")"
            , "." + a.getNomSetter() + "(valeur)"
            , ".build();"
            , a.createExpect(this.objectInfo.className, this.objectInfo.getClassNameVariable())
            , "});"
        ].join(SAUT) + SAUT
    }
}
