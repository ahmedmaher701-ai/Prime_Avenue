// Finish asynchronous setup before enabling the sign-in button. Never await setup
// inside the click handler: Safari can lose the gesture that permits the popup.
export function createGoogleSignIn({prepare,signIn,onState=()=>{}}){
 let ready=false,busy=false;
 const preparation=Promise.resolve().then(prepare).then(()=>{ready=true;onState({ready,busy});});
 function start(){
  if(!ready||busy)return Promise.resolve(null);
  busy=true;onState({ready,busy});
  let attempt;
  try{attempt=signIn();}catch(error){busy=false;onState({ready,busy});return Promise.reject(error);}
  return Promise.resolve(attempt).finally(()=>{busy=false;onState({ready,busy});});
 }
 return {preparation,start};
}
