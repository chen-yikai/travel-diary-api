interface User {
  token: string;
  email: string;
  password: string;
}

interface Diary {
  token: string;
  diary_id: string;
  favorite_datetime: string;
}

export class Data {
  private static users: User[] = [];
  private static diaries: Diary[] = [];

  static addDiary(token: string, diary_id: string): Diary {
    const favorite_datetime = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);

    const diary = { token, diary_id, favorite_datetime };
    this.diaries.push(diary);

    return diary;
  }

  static getAllDiaries(token: string): Diary[] {
    return this.diaries.filter((diary) => diary.token === token);
  }

  static auth(email: string, password: string): string {
    if (
      this.users.some(
        (user) => user.email == email && user.password == password,
      )
    ) {
      return (
        this.users.find(
          (user) => user.email == email && user.password == password,
        )?.token || ""
      );
    } else if (this.users.some((user) => user.email == email)) {
      throw new Error("Incorrect password");
    }
    const token = crypto.randomUUID().replace(/-/g, "").toUpperCase();
    this.users.push({ email, password, token });
    return token;
  }

  static getAllUsers() {
    return this.users;
  }
}
