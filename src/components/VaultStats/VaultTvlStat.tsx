import { isCowcentratedLiquidityVault, type VaultEntity } from '../../features/data/entities/vault';
import { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { VaultValueStat } from '../VaultValueStat';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { formatLargeUsd, formatPercent } from '../../helpers/format';
import {
  selectLpBreakdownByTokenAddress,
  selectTokenByAddress,
} from '../../features/data/selectors/tokens';
import type { BigNumber } from 'bignumber.js';
import { InterestTooltipContent } from '../InterestTooltipContent';
import type { PlatformEntity } from '../../features/data/entities/platform';
import { selectPlatformById } from '../../features/data/selectors/platforms';
import { useAppSelector } from '../../store';
import { getVaultUnderlyingTvlAndBeefySharePercent } from '../../helpers/tvl';

export type VaultTvlStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultTvlStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultTvlStatProps) {
  const label = 'VaultStat-TVL';
  const vault = selectVaultById(state, vaultId);
  const isLoaded =
    state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.prices.alreadyLoadedOnce;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
    };
  }

  // deposit can be moo or oracle
  const tvl = selectVaultTvl(state, vaultId);
  const breakdown = selectLpBreakdownByTokenAddress(
    state,
    vault.chainId,
    vault.depositTokenAddress
  );

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const platformId = isCowcentratedLiquidityVault(vault)
    ? depositToken.providerId!
    : vault.platformId;

  if (!breakdown) {
    return {
      label,
      value: formatLargeUsd(tvl),
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  const { percent, underlyingTvl } = getVaultUnderlyingTvlAndBeefySharePercent(
    vault,
    breakdown,
    tvl
  );

  return {
    label,
    value: formatLargeUsd(tvl),
    subValue: formatLargeUsd(underlyingTvl),
    blur: false,
    loading: false,
    tooltip: (
      <TvlShareTooltip
        platformId={platformId}
        underlyingTvl={underlyingTvl}
        vaultTvl={tvl}
        percent={percent}
      />
    ),
  };
}

type TvlShareTooltipProps = {
  underlyingTvl: BigNumber;
  vaultTvl: BigNumber;
  percent: number;
  platformId: PlatformEntity['id'];
};

export const TvlShareTooltip = memo<TvlShareTooltipProps>(function TvlShareTooltip({
  underlyingTvl,
  vaultTvl,
  percent,
  platformId,
}) {
  const platform = useAppSelector(state => selectPlatformById(state, platformId));
  const rows = useMemo(() => {
    return [
      {
        label: 'Vault-Breakdown-Tvl-Vault',
        value: formatLargeUsd(vaultTvl),
      },
      {
        label: 'Vault-Breakdown-Tvl-Underlying',
        value: formatLargeUsd(underlyingTvl),
        labelTextParams: { platform: platform.name },
      },
      {
        label: 'Vault-Breakdown-Tvl-Share',
        value: formatPercent(percent),
      },
    ];
  }, [vaultTvl, underlyingTvl, platform.name, percent]);

  return <InterestTooltipContent rows={rows} />;
});
