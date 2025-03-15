import { Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity()
@Unique(['gitHub_id'])
export class Repo {
  @PrimaryColumn()
  public id!: number;

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
