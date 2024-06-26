# Link repo
- https://gitlab.upt.ro/filoftei.grigore/bizlinker/-/tree/master?ref_type=heads 
- este pe branch-ul master


# Prerequisities
- package manager pentru nodejs (npm, yarn sau bun)
- mysqlworkbench si/sau mysqlcli
- chei de API: clerk, uploadthing, stripe
- crearea de produse stripe pentru facilitarea testarii (optional, vezi: https://docs.stripe.com/connect)
- optional homebrew pentru instalarea stripe-cli (sau se pot urma pasii de la ghidul de instalare: https://docs.stripe.com/stripe-cli)

## ENV VARIABLES

Pentru rularea locala este nevoie de completarea urmatoarelor variabile de mediu intr-un fisierul .env

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/firm/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/firm/sign-up

NEXT_PUBLIC_URL=http://localhost:3000/
NEXT_PUBLIC_DOMAIN=localhost:3000
NEXT_PUBLIC_SCHEME=http://

UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_CLIENT_ID=""
NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT=1 #comisioanele platformei
NEXT_PUBLIC_PLATFORM_ONETIME_FEE=1
NEXT_PUBLIC_PLATFORM_SUBSIDIARY_PERCENT=1 
NEXT_BIZLINKER_PRODUCT_ID= "" #pentru testing
DATABPASE_PASSWORD="" 

DATABASE_URL="" #baza de date, in cazul in care se doreste rularea locala se introduce aceeasi baza de date ca si in LOCAL_DATABASE_URL
PROD_DATABASE_URL=
LOCAL_DATABASE_URL="baza de date locala"
```

### Comenzi de rulare

```bash
git clone "link"# clonare repository
bun install # instalare dependinte
bun prisma db push # impingem schema in baza de date locala
bun run dev # rulam aplicatia
bun prisma studio # pentru a vizualiza baza de date prin intermediul prisma
brew install stripe/stripe-cli/stripe # pentru cli-ul stripe
stripe login # pentru a te loga in contul de stripe
stripe listen --forward-to localhost:3000/api/stripe/webhook # pentru a asculta evenimentele stripe
stripe trigger payment_intent.succeeded #testare ca sa vedem daca suntem contectati la stripe


```