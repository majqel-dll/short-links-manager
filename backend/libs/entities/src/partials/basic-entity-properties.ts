import { BeforeUpdate, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

export class BasicEntityProperties {

    @PrimaryGeneratedColumn({ type: "int" })
    public id: number;

    @CreateDateColumn({ type: `timestamptz` })
    public createdAt: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    public updatedAt?: Date;

    @BeforeUpdate()
    protected updateUpdatedAtProperty() {
        this.updatedAt = new Date();
    }

}
