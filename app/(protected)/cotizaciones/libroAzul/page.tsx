// "use client"

// import {
//     login,
//     getAnios,
//     getMarcasPorAnio,
//     getModelosPorAnioMarca,
//     getVersionesPorAnioMarcaModelo,
//     getPrecioVersionPorClave
// } from "@/actions/LibroAzul";
// import {
//     iGetKey,
//     iGetAnios,
//     iGetMarcasPorAnio,
//     iGetModelosPorAnioMarca,
//     iGetPrecioVersionPorClave,
//     iGetVersionesPorAnioMarcaModelo
// } from "@/interfaces/LibroAzul";
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { useState } from "react";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// import { Loader2 } from "lucide-react"
// import { getAniosSchema, getMarcasPorAnioSchema, getModelosPorAnioMarcaSchema, getPrecioVersionPorClaveSchema, getVersionesPorAnioMarcaModeloSchema } from "@/schemas/libroAzulSchema";

// export default function LibroAzul() {

//     const [isLoggedIn, setIsLoggedIn] = useState(false)
//     const [username, setUsername] = useState('')
//     const [password, setPassword] = useState('')
//     const [apiKey, setApiKey] = useState<iGetKey | null>(null)
//     const [step, setStep] = useState(0)
//     const [years, setYears] = useState<iGetAnios[]>([])
//     const [brands, setBrands] = useState<iGetMarcasPorAnio[]>([])
//     const [models, setModels] = useState<iGetModelosPorAnioMarca[]>([])
//     const [versions, setVersions] = useState<iGetVersionesPorAnioMarcaModelo[]>([])
//     const [selectedYear, setSelectedYear] = useState<iGetAnios | null>(null)
//     const [selectedBrand, setSelectedBrand] = useState<iGetMarcasPorAnio | null>(null)
//     const [selectedModel, setSelectedModel] = useState<iGetModelosPorAnioMarca | null>(null)
//     const [selectedVersion, setSelectedVersion] = useState<iGetVersionesPorAnioMarcaModelo | null>(null)
//     const [price, setPrice] = useState<iGetPrecioVersionPorClave | null>(null)
//     const [isLoading, setIsLoading] = useState(false)
//     const [error, setError] = useState<string | null>(null)

//     // funcion para logearse
//     const handleLogin = async (e: React.FormEvent) => {
//         e.preventDefault()
//         setIsLoading(true)
//         setError(null)
//         try {
//             const key = await login(username, password)
//             if (key && key.length > 0) {
//                 setApiKey(key[0])
//                 setIsLoggedIn(true)
//                 loadYears(key[0])
//             } else {
//                 setError('Credenciales incorrectas')
//             }
//         } catch (error) {
//             setError('Error al iniciar sesión')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const loadYears = async (key: iGetKey) => {
//         setIsLoading(true)
//         setError(null)
//         try {
//             const yearsData = await getAnios(key)
//             if (yearsData) {
//                 const validatedYears = getAniosSchema.parse(yearsData)
//                 setYears(validatedYears)
//                 setStep(1)
//             } else {
//                 setError('No se pudieron cargar los años')
//             }
//         } catch (error) {
//             setError('Error al cargar los años')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const handleYearSelect = async (yearClave: string) => {
//         if (!apiKey) return
//         const year = years.find(y => y.Clave === yearClave)
//         if (!year) return
//         setSelectedYear(year)
//         setIsLoading(true)
//         setError(null)
//         try {
//             const brandsData = await getMarcasPorAnio(apiKey, year)
//             if (brandsData) {
//                 const validatedBrands = getMarcasPorAnioSchema.parse(brandsData)
//                 setBrands(validatedBrands)
//                 setStep(2)
//             } else {
//                 setError('No se pudieron cargar las marcas')
//             }
//         } catch (error) {
//             setError('Error al cargar las marcas')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const handleBrandSelect = async (brandClave: string) => {
//         if (!apiKey || !selectedYear) return
//         const brand = brands.find(b => b.Clave === brandClave)
//         if (!brand) return
//         setSelectedBrand(brand)
//         setIsLoading(true)
//         setError(null)
//         try {
//             const modelsData = await getModelosPorAnioMarca(apiKey, selectedYear, brand)
//             if (modelsData) {
//                 const validatedModels = getModelosPorAnioMarcaSchema.parse(modelsData)
//                 setModels(validatedModels)
//                 setStep(3)
//             } else {
//                 setError('No se pudieron cargar los modelos')
//             }
//         } catch (error) {
//             setError('Error al cargar los modelos')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const handleModelSelect = async (modelClave: string) => {
//         if (!apiKey || !selectedYear || !selectedBrand) return
//         const model = models.find(m => m.Clave === modelClave)
//         if (!model) return
//         setSelectedModel(model)
//         setIsLoading(true)
//         setError(null)
//         try {
//             const versionsData = await getVersionesPorAnioMarcaModelo(apiKey, selectedYear, selectedBrand, model)
//             if (versionsData) {
//                 const validatedVersions = getVersionesPorAnioMarcaModeloSchema.parse(versionsData)
//                 setVersions(validatedVersions)
//                 setStep(4)
//             } else {
//                 setError('No se pudieron cargar las versiones')
//             }
//         } catch (error) {
//             setError('Error al cargar las versiones')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const handleVersionSelect = async (versionClave: string) => {
//         if (!apiKey) return
//         const version = versions.find(v => v.Clave === versionClave)
//         if (!version) return
//         setSelectedVersion(version)
//         setIsLoading(true)
//         setError(null)
//         try {
//             const priceData = await getPrecioVersionPorClave(apiKey, version)
//             if (priceData) {
//                 const validatedPrice = getPrecioVersionPorClaveSchema.parse(priceData)
//                 setPrice(validatedPrice)
//                 setStep(5)
//             } else {
//                 setError('No se pudo obtener el precio')
//             }
//         } catch (error) {
//             setError('Error al obtener el precio')
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     if (!isLoggedIn) {
//         return (
//             <Card className="w-[350px]">
//                 <CardHeader>
//                     <CardTitle>Iniciar Sesión</CardTitle>
//                     <CardDescription>Ingresa tus credenciales para acceder al Libro Azul API</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                     <form onSubmit={handleLogin} className="space-y-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="username">Usuario</Label>
//                             <Input
//                                 id="username"
//                                 type="text"
//                                 value={username}
//                                 onChange={(e) => setUsername(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="password">Contraseña</Label>
//                             <Input
//                                 id="password"
//                                 type="password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                         </div>
//                         <Button type="submit" className="w-full" disabled={isLoading}>
//                             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
//                             Iniciar Sesión
//                         </Button>
//                     </form>
//                 </CardContent>
//                 {error && (
//                     <Alert variant="destructive">
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}
//             </Card>
//         )
//     }

//     return (
//         <Card className="w-[350px]">
//             <CardHeader>
//                 <CardTitle>Libro Azul API</CardTitle>
//                 <CardDescription>Selecciona las características del vehículo</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//                 {step >= 1 && (
//                     <div className="space-y-2">
//                         <Label htmlFor="year">Año</Label>
//                         <Select onValueChange={handleYearSelect} disabled={isLoading}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Selecciona un año" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {years.map(year => (
//                                     <SelectItem key={year.Clave} value={year.Clave}>{year.Nombre}</SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 )}
//                 {step >= 2 && (
//                     <div className="space-y-2">
//                         <Label htmlFor="brand">Marca</Label>
//                         <Select onValueChange={handleBrandSelect} disabled={isLoading}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Selecciona una marca" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {brands.map(brand => (
//                                     <SelectItem key={brand.Clave} value={brand.Clave}>{brand.Nombre}</SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 )}
//                 {step >= 3 && (
//                     <div className="space-y-2">
//                         <Label htmlFor="model">Modelo</Label>
//                         <Select onValueChange={handleModelSelect} disabled={isLoading}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Selecciona un modelo" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {models.map(model => (
//                                     <SelectItem key={model.Clave} value={model.Clave}>{model.Nombre}</SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 )}
//                 {step >= 4 && (
//                     <div className="space-y-2">
//                         <Label htmlFor="version">Versión</Label>
//                         <Select onValueChange={handleVersionSelect} disabled={isLoading}>
//                             <SelectTrigger>
//                                 <SelectValue placeholder="Selecciona una versión" />
//                             </SelectTrigger>
//                             <SelectContent>
//                                 {versions.map(version => (
//                                     <SelectItem key={version.Clave} value={version.Clave}>{version.Nombre}</SelectItem>
//                                 ))}
//                             </SelectContent>
//                         </Select>
//                     </div>
//                 )}
//                 {step === 5 && price && (
//                     <div className="text-center">
//                         <h3 className="text-lg font-semibold">Precio estimado:</h3>
//                         <p className="text-2xl font-bold">Venta: ${parseInt(price.Venta).toLocaleString()} {price.Moneda}</p>
//                         <p className="text-xl">Compra: ${parseInt(price.Compra).toLocaleString()} {price.Moneda}</p>
//                     </div>
//                 )}
//                 {isLoading && (
//                     <div className="flex justify-center">
//                         <Loader2 className="h-8 w-8 animate-spin" />
//                     </div>
//                 )}
//                 {error && (
//                     <Alert variant="destructive">
//                         <AlertTitle>Error</AlertTitle>
//                         <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                 )}
//             </CardContent>
//             <CardFooter className="flex justify-between">
//                 <Button variant="outline" onClick={() => {
//                     setStep(0)
//                     setSelectedYear(null)
//                     setSelectedBrand(null)
//                     setSelectedModel(null)
//                     setSelectedVersion(null)
//                     setPrice(null)
//                     if (apiKey) loadYears(apiKey)
//                 }} disabled={isLoading}>Reiniciar</Button>
//                 <Button onClick={() => {
//                     setIsLoggedIn(false)
//                     setApiKey(null)
//                     setStep(0)
//                     setSelectedYear(null)
//                     setSelectedBrand(null)
//                     setSelectedModel(null)
//                     setSelectedVersion(null)
//                     setPrice(null)
//                 }} disabled={isLoading}>Cerrar Sesión</Button>
//             </CardFooter>
//         </Card>
//     )
// }


import { Suspense } from 'react'
import LibroAzulForm from '@/components/admin/libroAzul/libroAzulForm'

export default function LibroAzul() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <LibroAzulForm />
        </Suspense>
    )
}