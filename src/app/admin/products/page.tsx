
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/contexts/AppContext';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2, Package, Search, ArrowLeft, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { formatCurrencyIDR } from '@/lib/utils';
import * as XLSX from 'xlsx';

const initialFormState: Omit<Product, 'id'> = {
  name: '',
  description: '',
  price: 0,
  category: '',
  imageUrl: '',
  stock: 0,
  dataAiHint: '',
};

const ITEMS_PER_PAGE = 10;

export default function AdminProductsPage() {
  const { currentUser, products, addProduct, updateProduct, deleteProduct, getProductById, productCategories, addProductsFromExcel } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormState);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, router]);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => a.name.localeCompare(b.name));
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const currentStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;


  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="flex justify-center items-center h-screen"><p>Loading or Access Denied...</p></div>;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? parseFloat(value) || 0 : value }));
  };
  
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData(prev => ({ ...prev, imageUrl: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    } else {
      if (!editingProduct) { 
        setFormData(prev => ({ ...prev, imageUrl: initialFormState.imageUrl }));
        setImagePreview(null);
      }
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    const product = getProductById(productId);
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl, 
        stock: product.stock,
        dataAiHint: product.dataAiHint || '',
      });
      setImagePreview(product.imageUrl); 
      setIsDialogOpen(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setIsDeleteDialogOpen(false);
      setDeletingProductId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || formData.price <= 0 || formData.stock < 0 || !formData.imageUrl) {
      toast({ title: "Validation Error", description: "Please fill all required fields and upload an image.", variant: "destructive" });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImagePreview(null);
  };
  
  const uniqueCategories = useMemo(() => {
    return ["", ...productCategories.filter(cat => cat && cat !== "All")];
  }, [productCategories]);

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
    } else {
      setExcelFile(null);
    }
  };

  const handleExcelUpload = () => {
    if (!excelFile) {
      toast({ title: "No File Selected", description: "Please select an Excel file to upload.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) throw new Error("File data is empty.");
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        const headers = jsonData[0].map(header => String(header).trim());
        const expectedHeaders = ["No", "Nama Produk", "Harga (Rp)", "Stock Qty", "Deskripsi", "AI Hint"];
        
        if (!expectedHeaders.every((h, i) => headers[i] === h)) {
           toast({ title: "Invalid Excel Format", description: `Headers do not match. Expected: ${expectedHeaders.join(', ')}. Found: ${headers.join(', ')}`, variant: "destructive" });
           return;
        }

        const productsToUpload: Array<Omit<Product, 'id' | 'category' | 'imageUrl'>> = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === '')) continue;

          const name = String(row[1] || '').trim();
          const price = parseFloat(String(row[2] || '0').replace(/[^0-9.-]+/g,""));
          const stock = parseInt(String(row[3] || '0'), 10);
          const description = String(row[4] || '').trim();
          const dataAiHint = String(row[5] || '').trim();

          if (!name) {
            toast({ title: "Skipping Row", description: `Row ${i+1}: Nama Produk is missing.`, variant: "warning" });
            continue;
          }
          if (isNaN(price) || price < 0) {
            toast({ title: "Skipping Row", description: `Row ${i+1}: Invalid Harga for ${name}.`, variant: "warning" });
            continue;
          }
           if (isNaN(stock) || stock < 0) {
            toast({ title: "Skipping Row", description: `Row ${i+1}: Invalid Stock Qty for ${name}.`, variant: "warning" });
            continue;
          }

          productsToUpload.push({
            name,
            price,
            stock,
            description,
            dataAiHint: dataAiHint || "product placeholder",
          });
        }

        if (productsToUpload.length > 0) {
          addProductsFromExcel(productsToUpload);
          setCurrentPage(1); // Reset to first page after upload
        } else {
          toast({ title: "No Products Found", description: "No valid products found in the Excel file to upload.", variant: "warning" });
        }
        setExcelFile(null);
        const fileInput = document.getElementById('excelUpload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';

      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast({ title: "Excel Processing Error", description: "Could not process the Excel file. Ensure it's a valid .xlsx or .xls file and matches the format.", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(excelFile);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
      </Button>
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center">
            <Package className="mr-3 h-10 w-10 text-primary" />
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Product Management</h1>
                <p className="mt-1 text-lg text-muted-foreground">Add, edit, or remove products from your store.</p>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <Button onClick={handleAddProduct}>
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
            </Button>
        </div>
      </header>

      <Card className="mb-8 shadow">
        <CardHeader>
            <CardTitle>Upload Products via Excel</CardTitle>
            <CardDescription>Upload multiple products using an Excel file (.xlsx, .xls). Ensure the format matches: No, Nama Produk, Harga (Rp), Stock Qty, Deskripsi, AI Hint. Category will be empty.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-start">
            <Input
                id="excelUpload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleExcelFileChange}
                className="flex-grow file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <Button onClick={handleExcelUpload} disabled={!excelFile} className="w-full sm:w-auto">
                <Upload className="mr-2 h-5 w-5" /> Upload Excel
            </Button>
        </CardContent>
      </Card>

      <Card className="mb-8 shadow">
        <CardHeader>
            <CardTitle>Search Products</CardTitle>
            <CardDescription>Filter products by name or category.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10 w-full"
                />
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>Overview of all available products.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No products found. {searchTerm && "Try adjusting your search."}</p>
          ) : (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No.</TableHead>
                  <TableHead className="w-16 hidden md:table-cell">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Stock</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>{currentStartIndex + index + 1}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Image src={product.imageUrl || 'https://placehold.co/40x40.png'} alt={product.name} width={40} height={40} className="rounded-md object-cover" data-ai-hint={product.dataAiHint || "product image"} />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{product.category}</TableCell>
                    <TableCell className="text-right">{formatCurrencyIDR(product.price)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{product.stock}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product.id)} className="mr-2 hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)} className="hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the details of this product.' : 'Fill in the details for the new product.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (IDR)</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleInputChange} required min="0.01" step="0.01" />
              </div>
              <div>
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" name="stock" type="number" value={formData.stock} onChange={handleInputChange} required min="0" step="1" />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
                <Select name="category" value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueCategories.map(cat => cat && ( 
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
              <Label htmlFor="imageUpload">Product Image</Label>
              <Input id="imageUpload" name="imageUpload" type="file" accept="image/*" onChange={handleImageChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48">
                  <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="contain" className="rounded-md border" />
                </div>
              )}
               {!imagePreview && editingProduct?.imageUrl && (
                 <div className="mt-2 relative w-full h-48">
                  <Image src={editingProduct.imageUrl} alt="Current Image" layout="fill" objectFit="contain" className="rounded-md border" />
                </div>
               )}
            </div>
            <div>
              <Label htmlFor="dataAiHint">Data AI Hint (Optional, for image search)</Label>
              <Input id="dataAiHint" name="dataAiHint" value={formData.dataAiHint} onChange={handleInputChange} placeholder="e.g. electronics computer" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the product: {deletingProductId ? getProductById(deletingProductId)?.name : ''}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
    

    