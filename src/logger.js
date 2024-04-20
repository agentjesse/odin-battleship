export const logToConsole = (data)=> console.log(data);
export const tableToConsole = (data)=> console.table(data);
export const objectToString = (data)=> JSON.stringify( data, null, '   ' );
export const log2DStringArray = (arr)=> {
  let result = '';
  for (let i = 0; i < arr.length; i++) result += `${ arr[i].join(', ') }\n`;
  console.log(result);
};
