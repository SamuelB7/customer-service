import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListOrderHistoryUseCase } from '../../application/use-cases/list-order-history.use-case';
import { ManageAddressesUseCase } from '../../application/use-cases/manage-addresses.use-case';
import { ManageFollowedSellersUseCase } from '../../application/use-cases/manage-followed-sellers.use-case';
import { ManagePreferencesUseCase } from '../../application/use-cases/manage-preferences.use-case';
import { ManagePrivacyExportsUseCase } from '../../application/use-cases/manage-privacy-exports.use-case';
import { ManageProfileUseCase } from '../../application/use-cases/manage-profile.use-case';
import { ManageWishlistUseCase } from '../../application/use-cases/manage-wishlist.use-case';
import { CustomerActor } from '../../domain/ports/customer.repository';
import { CustomerAuthenticatedRequest } from './authenticated-request';
import { mapCustomerError } from './customer-error.mapper';
import { AddressDto, UpdateAddressDto } from './dtos/address.dto';
import { FollowSellerDto } from './dtos/followed-seller.dto';
import { PaginationQueryDto } from './dtos/pagination.dto';
import { UpdatePreferencesDto } from './dtos/preferences.dto';
import { UpdateProfileDto } from './dtos/profile.dto';
import { AddWishlistItemDto } from './dtos/wishlist.dto';
import { AccessTokenGuard } from './guards/access-token.guard';

@ApiTags('customers')
@Controller()
export class CustomerController {
  constructor(
    private readonly manageProfileUseCase: ManageProfileUseCase,
    private readonly manageAddressesUseCase: ManageAddressesUseCase,
    private readonly managePreferencesUseCase: ManagePreferencesUseCase,
    private readonly manageWishlistUseCase: ManageWishlistUseCase,
    private readonly manageFollowedSellersUseCase: ManageFollowedSellersUseCase,
    private readonly listOrderHistoryUseCase: ListOrderHistoryUseCase,
    private readonly managePrivacyExportsUseCase: ManagePrivacyExportsUseCase
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read authenticated customer profile' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/profile')
  getProfile(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.manageProfileUseCase.getProfile(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update authenticated customer profile' })
  @ApiBody({ type: UpdateProfileDto })
  @UseGuards(AccessTokenGuard)
  @Put('customers/me/profile')
  updateProfile(@Req() request: CustomerAuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.handle(
      this.manageProfileUseCase.updateProfile(this.actor(request), {
        displayName: dto.displayName,
        phone: dto.phone,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined
      })
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List delivery addresses' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/addresses')
  listAddresses(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.manageAddressesUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create delivery address' })
  @ApiBody({ type: AddressDto })
  @UseGuards(AccessTokenGuard)
  @Post('customers/me/addresses')
  addAddress(@Req() request: CustomerAuthenticatedRequest, @Body() dto: AddressDto) {
    return this.handle(this.manageAddressesUseCase.add(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery address' })
  @ApiBody({ type: UpdateAddressDto })
  @UseGuards(AccessTokenGuard)
  @Put('customers/me/addresses/:addressId')
  updateAddress(@Req() request: CustomerAuthenticatedRequest, @Param('addressId') addressId: string, @Body() dto: UpdateAddressDto) {
    return this.handle(this.manageAddressesUseCase.update(this.actor(request), addressId, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete delivery address' })
  @UseGuards(AccessTokenGuard)
  @Delete('customers/me/addresses/:addressId')
  deleteAddress(@Req() request: CustomerAuthenticatedRequest, @Param('addressId') addressId: string) {
    return this.handle(this.manageAddressesUseCase.remove(this.actor(request), addressId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set default delivery address' })
  @UseGuards(AccessTokenGuard)
  @Put('customers/me/addresses/:addressId/default')
  setDefaultAddress(@Req() request: CustomerAuthenticatedRequest, @Param('addressId') addressId: string) {
    return this.handle(this.manageAddressesUseCase.setDefault(this.actor(request), addressId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read communication preferences' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/preferences')
  getPreferences(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.managePreferencesUseCase.get(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update communication preferences' })
  @ApiBody({ type: UpdatePreferencesDto })
  @UseGuards(AccessTokenGuard)
  @Put('customers/me/preferences')
  updatePreferences(@Req() request: CustomerAuthenticatedRequest, @Body() dto: UpdatePreferencesDto) {
    return this.handle(this.managePreferencesUseCase.update(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List wishlist items' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/wishlist')
  listWishlist(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.manageWishlistUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add item to wishlist' })
  @ApiBody({ type: AddWishlistItemDto })
  @UseGuards(AccessTokenGuard)
  @Post('customers/me/wishlist/items')
  addWishlistItem(@Req() request: CustomerAuthenticatedRequest, @Body() dto: AddWishlistItemDto) {
    return this.handle(this.manageWishlistUseCase.add(this.actor(request), dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove item from wishlist' })
  @UseGuards(AccessTokenGuard)
  @Delete('customers/me/wishlist/items/:itemId')
  removeWishlistItem(@Req() request: CustomerAuthenticatedRequest, @Param('itemId') itemId: string) {
    return this.handle(this.manageWishlistUseCase.remove(this.actor(request), itemId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a share token for wishlist' })
  @UseGuards(AccessTokenGuard)
  @Post('customers/me/wishlist/share')
  shareWishlist(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.manageWishlistUseCase.share(this.actor(request)));
  }

  @ApiOperation({ summary: 'Read public shared wishlist' })
  @ApiOkResponse({ description: 'Returns shared wishlist items or an empty list.' })
  @Get('wishlists/:shareToken')
  getSharedWishlist(@Param('shareToken') shareToken: string) {
    return this.handle(this.manageWishlistUseCase.getSharedItems(shareToken));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List followed sellers' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/followed-sellers')
  listFollowedSellers(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.manageFollowedSellersUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow a seller' })
  @ApiBody({ type: FollowSellerDto })
  @UseGuards(AccessTokenGuard)
  @Post('customers/me/followed-sellers')
  followSeller(@Req() request: CustomerAuthenticatedRequest, @Body() dto: FollowSellerDto) {
    return this.handle(this.manageFollowedSellersUseCase.follow(this.actor(request), dto.sellerId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfollow a seller' })
  @UseGuards(AccessTokenGuard)
  @Delete('customers/me/followed-sellers/:sellerId')
  unfollowSeller(@Req() request: CustomerAuthenticatedRequest, @Param('sellerId') sellerId: string) {
    return this.handle(this.manageFollowedSellersUseCase.unfollow(this.actor(request), sellerId));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List customer purchase history references' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/orders')
  listOrders(@Req() request: CustomerAuthenticatedRequest, @Query() query: PaginationQueryDto) {
    return this.handle(
      this.listOrderHistoryUseCase.execute(this.actor(request), {
        page: query.page ?? 1,
        pageSize: query.pageSize ?? 20
      })
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request privacy data export' })
  @UseGuards(AccessTokenGuard)
  @HttpCode(200)
  @Post('customers/me/privacy-exports')
  createPrivacyExport(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.managePrivacyExportsUseCase.create(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List privacy export requests' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/privacy-exports')
  listPrivacyExports(@Req() request: CustomerAuthenticatedRequest) {
    return this.handle(this.managePrivacyExportsUseCase.list(this.actor(request)));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Read privacy export request status' })
  @UseGuards(AccessTokenGuard)
  @Get('customers/me/privacy-exports/:requestId')
  getPrivacyExport(@Req() request: CustomerAuthenticatedRequest, @Param('requestId') requestId: string) {
    return this.handle(this.managePrivacyExportsUseCase.get(this.actor(request), requestId));
  }

  private actor(request: CustomerAuthenticatedRequest): CustomerActor {
    return {
      authUserId: request.user.id,
      email: request.user.email
    };
  }

  private async handle<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      mapCustomerError(error);
    }
  }
}

