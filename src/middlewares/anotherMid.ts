export async function encoreUnTest(fauxJWT: Request) {
  try {
    const data: any = await fauxJWT.json();
    if (data.name === "123") {
      console.log("ACCES AUTORIZED");
    } else {
      console.log("ACCES DENIED");
    }
  } catch (error: any) {
    console.log(error);
  }
}
