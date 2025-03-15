import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class Repo {
  @PrimaryColumn()
  public id!: number;

	@Index()
  @Column()
  public gitHub_id!: number;

	@Column()
	public name!: string;

  @Column()
  public html_url!: string;

  @Column()
  public description!: string;

  @Column()
  public language!: string;

  @Column()
  public stargazers_count!: number;
}
