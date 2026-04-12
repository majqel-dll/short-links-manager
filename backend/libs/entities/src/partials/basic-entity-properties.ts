import { BeforeUpdate, Column, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";
import { Exclude } from "class-transformer";

export class BasicEntityProperties {
    @PrimaryGeneratedColumn({ type: "int" })
    public id: number;

    @CreateDateColumn({ type: `timestamptz` })
    public createdAt: Date;

    @Column({ type: `timestamptz`, nullable: true, default: null })
    @Exclude()
    public updatedAt?: Date;

    @BeforeUpdate()
    protected updateUpdatedAtProperty() {
        this.updatedAt = new Date();
    }
}
