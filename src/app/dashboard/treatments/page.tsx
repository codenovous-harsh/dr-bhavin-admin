'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useState } from 'react';

// Dummy treatment data
const dummyTreatments = [
  {
    id: '1',
    name: 'Root Canal Therapy',
    category: 'Endodontics',
    duration: '90 min',
    price: '$800',
    status: 'available',
    description: 'Complete root canal treatment including X-rays'
  },
  {
    id: '2',
    name: 'Teeth Whitening',
    category: 'Cosmetic',
    duration: '60 min',
    price: '$400',
    status: 'available',
    description: 'Professional teeth whitening treatment'
  },
  {
    id: '3',
    name: 'Dental Implant',
    category: 'Surgery',
    duration: '120 min',
    price: '$2500',
    status: 'available',
    description: 'Single tooth implant with crown'
  },
  {
    id: '4',
    name: 'Orthodontic Consultation',
    category: 'Orthodontics',
    duration: '45 min',
    price: '$150',
    status: 'available',
    description: 'Initial consultation for braces or aligners'
  },
  {
    id: '5',
    name: 'Wisdom Tooth Extraction',
    category: 'Surgery',
    duration: '60 min',
    price: '$600',
    status: 'available',
    description: 'Surgical extraction of wisdom tooth'
  },
  {
    id: '6',
    name: 'Dental Cleaning',
    category: 'Preventive',
    duration: '30 min',
    price: '$120',
    status: 'available',
    description: 'Professional cleaning and polishing'
  }
];

const categories = [
  'All',
  'Endodontics',
  'Cosmetic',
  'Surgery',
  'Orthodontics',
  'Preventive'
];

export default function TreatmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTreatments = dummyTreatments.filter((treatment) => {
    const matchesSearch =
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || treatment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className='flex-1 space-y-4 p-4 pt-6 md:p-8'>
      <div className='flex items-center justify-between space-y-2'>
        <h2 className='text-3xl font-bold tracking-tight'>Treatments</h2>
        <div className='flex items-center space-x-2'>
          <Button>
            <Icons.add className='mr-2 h-4 w-4' />
            Add Treatment
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total Treatments
            </CardTitle>
            <Icons.health className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>48</div>
            <p className='text-muted-foreground text-xs'>
              6 categories available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>This Week</CardTitle>
            <Icons.dashboard className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>156</div>
            <p className='text-muted-foreground text-xs'>
              Treatments performed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Popular Treatment
            </CardTitle>
            <Icons.check className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>Cleaning</div>
            <p className='text-muted-foreground text-xs'>42 this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue</CardTitle>
            <Icons.billing className='text-muted-foreground h-4 w-4' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>$45,678</div>
            <p className='text-muted-foreground text-xs'>+12% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Treatments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment Catalog</CardTitle>
          <CardDescription>
            Manage your treatment offerings and pricing
          </CardDescription>
          <div className='flex gap-4 py-4'>
            <Input
              placeholder='Search treatments...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-sm'
            />
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.map((treatment) => (
                <TableRow key={treatment.id}>
                  <TableCell className='font-medium'>
                    {treatment.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{treatment.category}</Badge>
                  </TableCell>
                  <TableCell>{treatment.duration}</TableCell>
                  <TableCell className='font-semibold'>
                    {treatment.price}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        treatment.status === 'available'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {treatment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className='max-w-[200px] truncate'>
                    {treatment.description}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <span className='sr-only'>Open menu</span>
                          <Icons.ellipsis className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Treatment</DropdownMenuItem>
                        <DropdownMenuItem>Update Pricing</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className='text-red-600'>
                          Delete Treatment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
