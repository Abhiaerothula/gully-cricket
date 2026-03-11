import{useState,useEffect}from'react'
export function useStorage(key,fallback){
  const[value,setValue]=useState(()=>{
    try{const s=localStorage.getItem(key);return s?JSON.parse(s):fallback}catch{return fallback}
  })
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}},[key,value])
  return[value,setValue]
}
