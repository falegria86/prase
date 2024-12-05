"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { StepProps } from "@/types/cotizador";
import {
  getMarcasPorAnio,
  getModelosPorAnioMarca,
  getVersionesPorAnioMarcaModelo,
  getPrecioVersionPorClave,
} from "@/actions/LibroAzul";
import { formatCurrency } from "@/lib/format";
import {
  iGetMarcasPorAnio,
  iGetModelosPorAnioMarca,
  iGetVersionesPorAnioMarcaModelo,
  iGetPrecioVersionPorClave,
} from "@/interfaces/LibroAzul";
import LocationCombobox from "./LocationCombobox";
import { Feature } from "@/interfaces/GeoApifyInterface";

export const VehicleDataStep = ({
  form,
  apiKey,
  years,
  setIsStepValid,
}: StepProps) => {
  const [brands, setBrands] = useState<iGetMarcasPorAnio[]>([]);
  const [models, setModels] = useState<iGetModelosPorAnioMarca[]>([]);
  const [versions, setVersions] = useState<iGetVersionesPorAnioMarcaModelo[]>(
    []
  );
  const [price, setPrice] = useState<iGetPrecioVersionPorClave | null>(null);
  const [loading, setLoading] = useState(false);

  const validateFields = async () => {
    const fieldsToValidate = [
      "Modelo",
      "Marca",
      "Submarca",
      "Version",
      "CP",
    ] as const;

    const validationResults = await Promise.all(
      fieldsToValidate.map(async (field) => {
        const isValid = await form.trigger(field);
        return isValid;
      })
    );

    const isValid = validationResults.every(Boolean);
    setIsStepValid?.(isValid);

    return isValid;
  };

  // Efecto para validación continua
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (name) {
        validateFields();
      }
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Efecto para restaurar datos cuando se vuelve al paso
  useEffect(() => {
    const restoreData = async () => {
      const formData = form.getValues();
      if (formData.Modelo) {
        await handleYearSelect(formData.Modelo);
      }
    };
    restoreData();
  }, []);

  const handleYearSelect = async (yearClave: string) => {
    if (!apiKey || !years) return;

    setLoading(true);
    try {
      const year = years.find((y) => y.Clave === yearClave);
      if (!year) return;

      form.setValue("Modelo", yearClave, { shouldValidate: true });
      const brandsData = await getMarcasPorAnio(apiKey, year);
      setBrands(brandsData || []);

      // Resetear campos dependientes
      form.setValue("Marca", "", { shouldValidate: true });
      form.setValue("Submarca", "", { shouldValidate: true });
      form.setValue("Version", "", { shouldValidate: true });
      form.setValue("marcaNombre", "");
      form.setValue("modeloNombre", "");
      form.setValue("versionNombre", "");
      setModels([]);
      setVersions([]);
      setPrice(null);

      await validateFields();
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = async (brandClave: string) => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const brand = brands.find((b) => b.Clave === brandClave);
      if (!brand) return;

      form.setValue("Marca", brandClave, { shouldValidate: true });
      form.setValue("marcaNombre", brand.Nombre);

      const modelsData = await getModelosPorAnioMarca(
        apiKey,
        form.getValues("Modelo"),
        brand
      );
      setModels(modelsData || []);

      // Resetear campos dependientes
      form.setValue("Submarca", "", { shouldValidate: true });
      form.setValue("Version", "", { shouldValidate: true });
      form.setValue("modeloNombre", "");
      form.setValue("versionNombre", "");
      setVersions([]);
      setPrice(null);

      await validateFields();
    } catch (error) {
      console.error("Error loading models:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = async (modelClave: string) => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const model = models.find((m) => m.Clave === modelClave);
      if (!model) return;

      form.setValue("Submarca", modelClave, { shouldValidate: true });
      form.setValue("modeloNombre", model.Nombre);

      const versionsData = await getVersionesPorAnioMarcaModelo(
        apiKey,
        form.getValues("Modelo"),
        form.getValues("Marca"),
        model
      );
      setVersions(versionsData || []);

      form.setValue("Version", "", { shouldValidate: true });
      form.setValue("versionNombre", "");
      setPrice(null);

      await validateFields();
    } catch (error) {
      console.error("Error loading versions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = async (versionClave: string) => {
    if (!apiKey) return;

    setLoading(true);
    try {
      const version = versions.find((v) => v.Clave === versionClave);
      if (!version) return;

      form.setValue("Version", versionClave, { shouldValidate: true });
      form.setValue("versionNombre", version.Nombre);

      const priceData = await getPrecioVersionPorClave(apiKey, version);
      setPrice(priceData || null);

      if (priceData) {
        form.setValue("SumaAsegurada", priceData.Venta);
        form.setValue("minSumaAsegurada", priceData.Compra);
        form.setValue("maxSumaAsegurada", priceData.Venta);
      }

      await validateFields();
    } catch (error) {
      console.error("Error loading price:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: Feature) => {
    const postcode = location.properties.postcode;
    
    if (postcode) {
      form.setValue("CP", postcode, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      validateFields();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Campo Año */}
      <FormField
        control={form.control}
        name="Modelo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año</FormLabel>
            <Select
              disabled={loading}
              onValueChange={(value) => {
                field.onChange(value);
                handleYearSelect(value);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona año" />
              </SelectTrigger>
              <SelectContent>
                {years?.map((year) => (
                  <SelectItem key={year.Clave} value={year.Clave}>
                    {year.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo Marca */}
      <FormField
        control={form.control}
        name="Marca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <Select
              disabled={loading || brands.length === 0}
              onValueChange={(value) => {
                field.onChange(value);
                handleBrandSelect(value);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona marca" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.Clave} value={brand.Clave}>
                    {brand.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo Modelo (Submarca) */}
      <FormField
        control={form.control}
        name="Submarca"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <Select
              disabled={loading || models.length === 0}
              onValueChange={(value) => {
                field.onChange(value);
                handleModelSelect(value);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona modelo" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.Clave} value={model.Clave}>
                    {model.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo Versión */}
      <FormField
        control={form.control}
        name="Version"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Versión</FormLabel>
            <Select
              disabled={loading || versions.length === 0}
              onValueChange={(value) => {
                field.onChange(value);
                handleVersionSelect(value);
              }}
              value={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona versión" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.Clave} value={version.Clave}>
                    {version.Nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo VIN */}
      <FormField
        control={form.control}
        name="VIN"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Serie (VIN)</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ingresa el número de serie"
                onChange={(e) => {
                  field.onChange(e);
                  validateFields();
                }}
                onBlur={() => form.trigger("VIN")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo de búsqueda de ubicación */}
      <div className="col-span-2">
        <LocationCombobox form={form} onLocationSelect={handleLocationSelect} />
      </div>

      {/* Indicador de carga */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-2 flex justify-center"
        >
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </motion.div>
      )}

      {/* Mostrar precio cuando esté disponible */}
      {price && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2 bg-primary/5 rounded-lg p-4"
        >
          <h4 className="font-semibold mb-2">Valor del vehículo</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Valor venta</p>
              <p className="text-lg font-medium">
                {formatCurrency(price.Venta)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor compra</p>
              <p className="text-lg font-medium">
                {formatCurrency(price.Compra)}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VehicleDataStep;
